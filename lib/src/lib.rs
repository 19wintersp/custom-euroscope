mod dib;

use std::collections::BTreeMap as Map;

use js_sys::{ Array as JsArray, Map as JsMap, Uint8Array, Uint8ClampedArray };

use wasm_bindgen::prelude::*;

use web_sys::console;

type Result<T> = std::result::Result<T, JsError>;

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct ImageInfo {
	pub id: u16,
	pub width: u32,
	pub height: u32,
	pub bpp: u16,
}

#[wasm_bindgen]
pub struct Exe {
	buffer: Vec<u8>,
	text: (u64, u64),
	images: Map<u16, (u64, u64)>,

	#[wasm_bindgen(js_name = images, getter_with_clone, readonly)]
	pub images_info: Vec<ImageInfo>,
}

#[wasm_bindgen(start)]
fn start() {
	#[cfg(feature = "console_error_panic_hook")]
	console_error_panic_hook::set_once();
}

#[wasm_bindgen]
impl Exe {
	pub fn parse(data: &Uint8Array) -> Result<Exe> {
		use object::{ Object, ObjectSection };
		use object::endian::LittleEndian;
		use object::pe::RT_BITMAP;
		use object::read::pe::{ PeFile32, ResourceDirectory };

		let buffer = data.to_vec();
		let mut images = Map::new();

		let file = PeFile32::parse(buffer.as_slice())?;

		let text = file
			.section_by_name_bytes(b".text")
			.ok_or_else(|| JsError::new("missing .text section"))?
			.file_range()
			.unwrap();

		let rsrc = file
			.section_by_name_bytes(b".rsrc")
			.ok_or_else(|| JsError::new("missing .rsrc section"))?;
		let rsrc_base = rsrc
			.pe_section()
			.virtual_address
			.get(LittleEndian);
		let rsrc_offset = rsrc.file_range().unwrap().0;
		let rsrc_dir = ResourceDirectory::new(rsrc.data()?);

		let bitmaps = rsrc_dir
			.root()?
			.entries
			.into_iter()
			.find(|entry| entry.name_or_id().id() == Some(RT_BITMAP))
			.ok_or_else(|| JsError::new("missing bitmap directory"))?
			.data(rsrc_dir)?
			.table()
			.ok_or_else(|| JsError::new("bitmap directory missing entries"))?
			.entries;

		for bitmap in bitmaps {
			let id = bitmap
				.name_or_id()
				.id()
				.ok_or_else(|| JsError::new("bitmap has name instead of id"))?;

			let data = bitmap
				.data(rsrc_dir)?
				.table()
				.ok_or_else(|| JsError::new("missing bitmap contents"))?
				.entries[0] // use first entry since not localised
				.data(rsrc_dir)?
				.data()
				.ok_or_else(|| JsError::new("missing bitmap data"))?;

			let offset = data.offset_to_data.get(LittleEndian) as u64;
			let length = data.size.get(LittleEndian) as u64;

			images.insert(id, (offset - rsrc_base as u64 + rsrc_offset, length));
		}

		let mut images_info = Vec::new();

		for (id, (offset, length)) in images.iter().map(|(a, b)| (*a, *b)) {
			let buffer = &buffer[offset as usize..][..length as usize];
			let ((width, height), bpp) = dib::parse(buffer)?;
			images_info.push(ImageInfo { id, width, height, bpp });
		}

		Ok(Exe {
			buffer,
			text,
			images,
			images_info,
		})
	}

	#[wasm_bindgen(js_name = readImage)]
	pub fn read_image(&self, id: u16, pixels: &Uint8ClampedArray) -> Result<()> {
		let (offset, length) = self.images.get(&id)
			.ok_or_else(|| JsError::new("unknown bitmap id"))?;

		let mut buffer = vec![0u8; pixels.length() as usize];
		dib::read(&self.buffer[*offset as usize..][..*length as usize], &mut buffer)?;
		pixels.copy_from(&buffer);

		Ok(())
	}

	#[wasm_bindgen(js_name = patchColours)]
	pub fn patch_colours(&mut self, map: &JsMap) -> Result<()> {
		static SAFE_COLOUR_PREFIXES: &[u8] = &[
			0x68, // PUSH imm32
			0xb9, // MOV ecx, imm32
		];

		let mut dict = Vec::new();

		for result in map.entries().into_iter() {
			let entry = result.map_err(|_| JsError::new("broken iterator"))?;
			assert!(entry.is_array());

			let array = JsArray::from(&entry);
			assert!(array.length() >= 2);

			let search  = array.at(0).as_f64();
			let replace = array.at(1).as_f64();

			if search.is_none() || replace.is_none() {
				return Err(JsError::new("invalid argument"))
			}

			let search  = ((search.unwrap()  as u32) << 8).to_be_bytes();
			let replace = ((replace.unwrap() as u32) << 8).to_be_bytes();
			dict.push((search, replace));
		}

		let data = &mut self.buffer[self.text.0 as usize..][..self.text.1 as usize];

		let replacements = data
			.windows(4)
			.enumerate()
			.filter_map(|(i, bytes)|
				dict
					.iter()
					.find_map(|(search, replace)| (bytes == search).then_some((i, replace)))
			)
			.collect::<Vec<_>>();

		for (i, replace) in replacements {
			if SAFE_COLOUR_PREFIXES.contains(&data[i - 1]) {
				data[i..][..4].copy_from_slice(replace);
			} else {
				console::warn_1(
					&format!("unknown colour prefix byte {:02x}", &data[i - 1]).into()
				);
			}
		}

		Ok(())
	}

	#[wasm_bindgen(js_name = patchImage)]
	pub fn patch_image(&mut self, id: u16, pixels: &Uint8ClampedArray) -> Result<()> {
		let (offset, length) = self.images.get(&id)
			.ok_or_else(|| JsError::new("unknown bitmap id"))?;

		let mut buffer = vec![0u8; pixels.length() as usize];
		pixels.copy_to(&mut buffer);
		dib::patch(&mut self.buffer[*offset as usize..][..*length as usize], &buffer)?;

		Ok(())
	}

	pub fn finish(self, buffer: &Uint8Array) {
		buffer.copy_from(self.buffer.as_slice());
	}
}
