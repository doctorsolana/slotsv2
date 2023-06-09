import { lamportsToSol } from "gamba";
import { useGamba } from "gamba/react";
import {
  ActionBar,
  Button,
  ResponsiveSize,
  formatLamports,
} from "gamba/react-ui";
import React, { useCallback, useEffect, useState } from "react";
import * as Tone from "tone";
import { Dropdown } from "../../components/Dropdown";
import { WAGER_AMOUNTS, DEGEN_ARRAY, ITEMS } from "./constants";
import { getEmojiSelector } from "./gameLogic";
import jackpotSrc from "./jackpot.mp3";
import loseSrc from "./lose.mp3";
import selectSrc from "./selected.mp3";
import spinStartSrc from "./spinstart.mp3";
import { SlotContainer, SlotWindowContainer, WinPopup } from "./styles";
import jackpotSelectSrc from "./jackpotselect.mp3";
import winSrc from "./win.mp3";

// Constants
const INITIAL_WAGER = 50000000;
const JACKPOT_MULTIPLIER_THRESHOLD = 6;
const BIG_WIN_INCREMENT = 100;
const SMALL_WIN_INCREMENT = 50;
const SPIN_INTERVAL = 100;
const SUSPENSE_DURATION = 2000;

// Utility function to create and start sound
const createSound = (url: string) => new Tone.Player({ url }).toDestination();

const soundWin = createSound(winSrc);
const soundLose = createSound(loseSrc);
const soundSelect = createSound(selectSrc);
const soundSpinStart = createSound(spinStartSrc);
const soundJackpotSelect = createSound(jackpotSelectSrc);
const soundJackpot = createSound(jackpotSrc);

interface SlotWindowProps {
  emoji: string;
  isLightUp: boolean;
}

const SlotWindow: React.FC<SlotWindowProps> = ({ emoji, isLightUp }) => {
  return (
    <SlotWindowContainer className={isLightUp ? "light-up" : ""}>
      <img src={emoji} alt="Slot item" />
    </SlotWindowContainer>
  );
};

// Slots component
const Slots: React.FC = () => {
  const gamba = useGamba();
  const [slots, setSlots] = useState<string[]>([
    ITEMS["2"],
    ITEMS["2"],
    ITEMS["2"],
  ]);
  const [isSpinEnded, setIsSpinEnded] = useState<boolean>(false);
  const [result, setResult] = useState<number>(0);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [displayWinAmount, setDisplayWinAmount] = useState<number>(0);
  const [wager, setWager] = useState<number>(INITIAL_WAGER);
  const [lightUp, setLightUp] = useState<boolean[]>([false, false, false]);

  const updateSlot = useCallback(
    (i: number, newValue: string, light: boolean) => {
      setSlots((oldSlots) => {
        const newSlots = [...oldSlots];
        newSlots[i] = newValue;
        return newSlots;
      });

      //set lightUp for glow effect when emoji selected
      setLightUp((oldLightUp) => {
        const newLightUp = [...oldLightUp];
        newLightUp[i] = light;
        return newLightUp;
      });
    },
    []
  );

  // Stop spinning animation with suspense
  const stopInterval = useCallback(
    (i: number, interval: NodeJS.Timeout, finalCombination: string[]) => {
      setTimeout(() => {
        clearInterval(interval);
        updateSlot(i, finalCombination[i], true);

        // Check if the selected emoji is a jackpot
        if (finalCombination[i] === "jackpot") {
          soundJackpotSelect.start(); // Play jackpot select sound
        } else {
          soundSelect.start(); // Play regular select sound
        }

        // Check if this is the last slot
        if (i === finalCombination.length - 1) {
          setIsSpinEnded(true);
        }
      }, SUSPENSE_DURATION * (i + 1));
    },
    [updateSlot]
  );

  //end of spin logic
  useEffect(() => {
    if (isSpinEnded) {
      const winCondition = slots[0] === slots[1] && slots[1] === slots[2];

      if (winCondition) {
        // play jackpot if biggest win otherwise play win
        if (result > wager * JACKPOT_MULTIPLIER_THRESHOLD) {
          soundJackpot.start();
        } else {
          soundWin.start();
        }

        setWinAmount(lamportsToSol(result));

        //if big win count for longer if small win count quickly
        const incrementBy =
          result > wager ? BIG_WIN_INCREMENT : SMALL_WIN_INCREMENT;

        const win = lamportsToSol(result);
        const increment = win / incrementBy;

        // Start counting up effect
        let counter = 0;
        const intervalId = setInterval(() => {
          counter += increment; // increment by the same amount each time

          // Stop the interval when the count reaches the win amount
          if (counter >= win) {
            counter = win; // Ensure that counter is exactly win amount
            clearInterval(intervalId);
          }

          // This updates your state at each interval and once more when clearing the interval
          setDisplayWinAmount(counter);
        }, 50); // Adjust this value to control the speed of the counting effect
      } else {
        // You lose
        soundLose.start();
        setLightUp([false, false, false]);
      }

      setIsSpinEnded(false);
    }
  }, [isSpinEnded]);

  const play = async () => {
    setWinAmount(0);
    setLightUp([false, false, false]);

    try {
      // main gamba play function
      const res = await gamba.play(DEGEN_ARRAY, wager);
      soundSpinStart.start();

      // Start spinning animation with different intervals for each slot
      const spinIntervals = slots.map((_, i) => {
        return setInterval(() => {
          const keys = Object.keys(ITEMS);
          const newItem = ITEMS[keys[Math.floor(Math.random() * keys.length)]];
          updateSlot(i, newItem, false);
        }, SPIN_INTERVAL * (i + 1));
      });

      const result = await res.result();
      setResult(result.payout);

      //get the combination of emojis to display
      const finalCombination = getEmojiSelector(wager, result.payout);

      // Stop spinning animation with suspense
      spinIntervals.forEach((interval, i) =>
        stopInterval(i, interval, finalCombination)
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <ResponsiveSize>
        <SlotContainer>
          {slots.map((slot, index) => (
            <SlotWindow emoji={slot} isLightUp={lightUp[index]} key={index} />
          ))}
        </SlotContainer>
        {winAmount > 0 && (
          <WinPopup>Payout: {displayWinAmount.toFixed(4)} </WinPopup>
        )}
      </ResponsiveSize>
      <ActionBar>
        <Button onClick={play}>Spin</Button>
        <Dropdown
          value={wager}
          format={formatLamports}
          label="Wager"
          onChange={setWager}
          options={WAGER_AMOUNTS.map((value) => ({
            label: formatLamports(value),
            value,
          }))}
        />
      </ActionBar>
    </>
  );
};

export default Slots;
