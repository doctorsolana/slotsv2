import { ITEMS, BAD_WIN_ITEMS, MEDIUM_WIN_ITEMS } from './constants'

export const getEmojiSelector = (wager: number, payout: number) => {
  const badWin = payout > 0
  const mediumWin = payout > wager * 0.5
  const bigWin = payout > wager * 6.5

  console.log('badWin', badWin, 'mediumWin', mediumWin, 'bigWin', bigWin)

  let finalCombination: string[] = []

  const itemKeys = Object.keys(ITEMS)

  if (badWin) {
    if (bigWin) {
      // Select a combination of unicorns for big win
      finalCombination = [ITEMS['jackpot'],ITEMS['jackpot'], ITEMS['jackpot']]
    } else if (mediumWin) {
      // Select a single emoji from medium win items
      const emojiKey =
          MEDIUM_WIN_ITEMS[Math.floor(Math.random() * MEDIUM_WIN_ITEMS.length)]
      finalCombination = Array(3).fill(ITEMS[emojiKey])
    } else {
      // Select a single emoji from small win items
      const emojiKey =
          BAD_WIN_ITEMS[Math.floor(Math.random() * BAD_WIN_ITEMS.length)]
      finalCombination = Array(3).fill(ITEMS[emojiKey])
    }
  } else {
    // Randomly decide if we are going to display two identical emojis or not 50% of the time it will be close
    const displayTwoIdentical = Math.random() < 0.5

    if (displayTwoIdentical) {
      // Select one emoji to be shown twice and another to be shown once
      const firstEmojiKey = itemKeys[Math.floor(Math.random() * itemKeys.length)]
      let secondEmojiKey
      do {
        secondEmojiKey = itemKeys[Math.floor(Math.random() * itemKeys.length)]
      } while (firstEmojiKey === secondEmojiKey)

      // Add the emojis to the combination
      finalCombination = [ITEMS[firstEmojiKey], ITEMS[firstEmojiKey], ITEMS[secondEmojiKey]]
    } else {
      // Select three different emojis
      while (finalCombination.length < 3) {
        const newEmojiKey = itemKeys[Math.floor(Math.random() * itemKeys.length)]
        const newEmoji = ITEMS[newEmojiKey]
        if (!finalCombination.includes(newEmoji)) {
          finalCombination.push(newEmoji)
        }
      }
    }
  }

  return finalCombination
}
