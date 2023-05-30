import { solToLamports } from 'gamba'
import jackpot from './images/jackpot.png';
import img_2 from './images/2.png';
import img_3 from './images/3.png';
import img_4 from './images/4.png';

export const ITEMS: { [key: string]: string } = {
  'jackpot': jackpot,
  '2': img_2,
  '3': img_3,
  '4': img_4,
};

export const MEDIUM_WIN_ITEMS = ['2','3','4']

export const BAD_WIN_ITEMS = ['3','4']

export const DEGEN_ARRAY = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0x * 10, lose (10 outcomes array sum = 0)
  0, 0, 0, 0, 0, 0,  // 0x * 6 lose (16 outcomes array sum = 0)
  0.5, 0.5, 0.5, 0.5, 0.5, 0.5, // 0.5x * 6, small win (22 outcomes array sum = 3)
  1, 1, 1, 1, // 1x * 4, small win (26 outcomes array sum = 7)
  2, 2, 2, // 2x * 3, small win (29 outcomes array sum = 13)
  3, 3, 3, // 3x * 3, medium win (32 outcomes array sum = 22)
  5, // 5x * 1, medium win (33 outcomes array sum = 27)
  7] // 7x * 1, very big win (34 outcomes array sum = 34)

export const WAGER_AMOUNTS = [
  0.01,
  0.05,
  0.1,
  .25,
  0.5,
  0.75,
].map(solToLamports)
