use crate::{ JsError, Result };

use std::collections::HashMap;

use bit_vec::BitVec;

pub fn parse(buffer: &[u8]) -> Result<((u32, u32), u16)> {
	Ok((
		(
			u32::from_le_bytes(buffer[4..][..4].try_into().unwrap()),
			u32::from_le_bytes(buffer[8..][..4].try_into().unwrap()),
		),
		u16::from_le_bytes(buffer[14..][..2].try_into().unwrap()),
	))
}

pub fn read(buffer: &[u8], pixels: &mut [u8]) -> Result<()> {
	let width = u32::from_le_bytes(buffer[4..][..4].try_into().unwrap()) as usize;
	let height = u32::from_le_bytes(buffer[8..][..4].try_into().unwrap()) as usize;

	let bpp = buffer[14]; // 2B but always <= 32
	let opp = bpp as usize / 8;

	if bpp <= 16 {
		let palette_size = u32::from_le_bytes(buffer[32..][..4].try_into().unwrap());
		let palette_size = if palette_size == 0 { 1 << bpp } else { palette_size };

		let mut palette = Vec::new();
		let mut base_rd = 40;

		for _ in 0..palette_size as usize {
			palette.push([
				buffer[base_rd + 2],
				buffer[base_rd + 1],
				buffer[base_rd + 0],
				0xff,
			]);
			base_rd += 4;
		}

		let row = (width * bpp as usize).next_multiple_of(32) / 8;
		let mut base_rd = base_rd + row * height;
		let mut base_wr = 0;

		if bpp >= 8 {
			for _ in 0..height {
				base_rd -= row;

				let mut bytes = buffer[base_rd..][..row].iter();

				for _ in 0..width {
					let mut n = 0;
					for _ in 0..opp {
						n <<= 8;
						n += *bytes.next().unwrap() as usize;
					}

					pixels[base_wr..][..4].clone_from_slice(&palette[n]);

					base_wr += 4;
				}
			}
		} else {
			for _ in 0..height {
				base_rd -= row;

				let mut bits = BitVec::from_bytes(&buffer[base_rd..][..row]).into_iter();

				for _ in 0..width {
					let mut n = 0;
					for _ in 0..bpp {
						n <<= 1;
						n += if bits.next().unwrap() { 1 } else { 0 };
					}

					pixels[base_wr..][..4].clone_from_slice(&palette[n]);

					base_wr += 4;
				}
			}
		}
	} else {
		let row = (width * opp).next_multiple_of(4);
		let mut base_rd = 40 + row * height;
		let mut base_wr = 0;

		for _ in 0..height {
			base_rd -= row;

			for x in 0..width {
				let base_rd = base_rd + x * opp;

				pixels[base_wr + 0] = buffer[base_rd + 2];
				pixels[base_wr + 1] = buffer[base_rd + 1];
				pixels[base_wr + 2] = buffer[base_rd + 0];
				pixels[base_wr + 3] = 0xff;

				base_wr += 4;
			}
		}
	}

	Ok(())
}

pub fn patch(buffer: &mut [u8], pixels: &[u8]) -> Result<()> {
	let width = u32::from_le_bytes(buffer[4..][..4].try_into().unwrap()) as usize;
	let height = u32::from_le_bytes(buffer[8..][..4].try_into().unwrap()) as usize;

	if pixels.len() != width * height * 4 {
		return Err(JsError::new("replacement image is wrong size"))
	}

	let bpp = buffer[14]; // 2B but always <= 32
	let opp = bpp as usize / 8;

	if bpp <= 16 {
		// TODO: quantisation

		let palette_size = u32::from_le_bytes(buffer[32..][..4].try_into().unwrap());
		let palette_size = if palette_size == 0 { 1 << bpp } else { palette_size };

		let mut palette = Vec::new();
		let mut palette_items = HashMap::new();
		let mut indices = Vec::new();

		let mut base_rd = 0;

		for _ in 0..height {
			for _ in 0..width {
				let pixel: [u8; 4] = pixels[base_rd..][..4].try_into().unwrap();

				if let Some(i) = palette_items.get(&pixel) {
					indices.push(*i);
				} else {
					indices.push(palette.len());
					palette_items.insert(pixel, palette.len());
					palette.push(pixel);
				}

				base_rd += 4;
			}
		}

		if palette.len() > palette_size as usize {
			return Err(JsError::new("replacement image has too many colours"))
		}

		let mut base_wr = 40;

		for [r, g, b, _] in palette {
			buffer[base_wr..][..4].clone_from_slice(&[b, g, r, 0x00]);
			base_wr += 4;
		}

		let row = (width * bpp as usize).next_multiple_of(32) / 8;
		let mut base_wr = 40 + palette_size as usize * 4 + row * height;

		for row_indices in indices.chunks(width)/* .rev() */ {
			base_wr -= row;
			let mut bits = BitVec::new();

			for index in row_indices {
				bits.append(&mut match bpp {
					1 | 2 | 4 => BitVec::from_fn(
						bpp as usize,
						|i| (index >> (bpp - 1 - i as u8)) & 1 > 0,
					),
					8 => BitVec::from_bytes(&[*index as u8]),
					16 => BitVec::from_bytes(&(*index as u16).to_le_bytes()),
					_ => unreachable!(),
				})
			}

			let bytes = bits.to_bytes();
			buffer[base_wr..][..bytes.len()].clone_from_slice(&bytes);
		}
	} else {
		let row = (width * opp).next_multiple_of(4);
		let mut base_wr = 40 + row * height;
		let mut base_rd = 0;

		for _ in 0..height {
			base_wr -= row;

			for x in 0..width {
				let base_wr = base_wr + x * opp;

				buffer[base_wr + 2] = pixels[base_rd + 0];
				buffer[base_wr + 1] = pixels[base_rd + 1];
				buffer[base_wr + 0] = pixels[base_rd + 2];

				if opp == 4 {
					buffer[base_wr + 3] = pixels[base_rd + 3];
				}

				base_rd += 4;
			}
		}
	}

	Ok(())
}
