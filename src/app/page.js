"use client"; // This is a client component 👈🏽

import styles from './page.module.css'
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';

export default function Index() {
  const [pph, setPph] = useState();
  const [pints, setPints] = useState();
  const [stamp, setStamp] = useState();
  const [elapsed, setElapsed] = useState();
  const [elapsedString, setElapsedString] = useState();
  const [lastPintTime, setLastPintTime] = useState();
  const [currentPintTime, setCurrentPintTime] = useState();
  const [bestPintTime, setBestPintTime] = useState();
  const [timer, setTimer] = useState();

  useEffect(() => {
    if (elapsed) sessionStorage.setItem('elapsed', elapsed);
    if (elapsedString) sessionStorage.setItem('elapsedString', elapsedString);
    if (lastPintTime) sessionStorage.setItem('lastPintTime', lastPintTime);
    if (currentPintTime) sessionStorage.setItem('currentPintTime', currentPintTime);
    if (bestPintTime) sessionStorage.setItem('bestPintTime', bestPintTime);
    if (stamp) sessionStorage.setItem('stamp', stamp);
    if (pph) sessionStorage.setItem('pph', pph);
    if (pints) sessionStorage.setItem('pints', JSON.stringify(pints));
  }, [elapsed, elapsedString, lastPintTime, currentPintTime, pints, stamp, pph]);

  useEffect(() => {
    setPph(sessionStorage.getItem('pph') || null);
    setElapsedString(sessionStorage.getItem('elapsedString') || '00:00');
    setElapsed(sessionStorage.getItem('elapsed') ? parseInt(sessionStorage.getItem('elapsed')) : null);
    setLastPintTime(sessionStorage.getItem('lastPintTime') || null);
    setCurrentPintTime(sessionStorage.getItem('currentPintTime') || '00:00');
    setBestPintTime(sessionStorage.getItem('bestPintTime') || null);
    setStamp(sessionStorage.getItem('stamp') ? new Date(sessionStorage.getItem('stamp')) : null);
    setPints(sessionStorage.getItem('pints') ? JSON.parse(sessionStorage.getItem('pints')) : []);
  }, []);

  const startSess = () => {
    setStamp(new Date());
    startPint();
  }

  useEffect(() => {
    if( stamp ) {
      clearInterval(timer);
      setTimer(setInterval(() => {
        setElapsed(new Date() - stamp);
      }, 5000));
    }
  }, [stamp]);

  useEffect(() => {
    if (elapsed) {
      let hour = 3600000;
      if (pints.length > 1) {
        setPph(((pints.length-1) * (hour / elapsed)).toFixed(2));
      }

      const elapsedDate = new Date(null);
      elapsedDate.setSeconds(elapsed/1000);
      setElapsedString(elapsedDate.toISOString().slice(11, 16));

      const pintDate = new Date(null);
      pintDate.setSeconds((new Date() - new Date(pints[pints.length - 1].start)) / 1000);
      setCurrentPintTime(pintDate.toISOString().slice(11, 16));
    }
  }, [elapsed, pints]);

  const reset = () => {
    setPph(null);
    setElapsedString('00:00');
    setElapsed(null);
    setLastPintTime(null);
    setBestPintTime(null);
    setCurrentPintTime('00:00');
    setPints([]);
    startSess();
  }

  const nextPint = () => {
    finishPint();
    startPint();
  }

  const startPint = () => {
    setPints(prev => [...prev, {
      start: new Date()
    }]);
  }

  const finishPint = () => {
    if( !lastPintTime ) {
      setBestPintTime(currentPintTime);
    } else {
      setBestPintTime(currentPintTime < lastPintTime ? currentPintTime : lastPintTime);
    }
    setLastPintTime(currentPintTime);
    setCurrentPintTime('00:00');
    setPints(prev => {
      prev[prev.length - 1].end = new Date();
      return prev
    });
  }

  useEffect(() => {
    console.log(pints);
  }, [pints]);  

  return (
    <main className={styles.main}>
      { stamp ? (
        <>
          <div className={styles.header}>
            {pph && pints && pints.length > 1 && <h1>{pph} PPH</h1>}
          </div>
          <div className={styles.meta}>
            <h4><span>Session started:</span> {stamp.toLocaleTimeString().substring(0,5)}</h4>
            <h4><span>Session time:</span> {elapsedString}</h4>
            {bestPintTime && <h4><span>Best pint:</span> {bestPintTime}</h4>}
            {lastPintTime && <h4><span>Last pint:</span> {lastPintTime}</h4>}
            {currentPintTime && <h4><span>Current pint:</span> {currentPintTime}</h4>}
            <h4><span>Pint count:</span> {pints.length - 1}</h4>
            <div>
              <Button onClick={reset} variant="text" color="info">Reset</Button>
            </div>
            <div className={styles.pints}>
              {pints.map((p,i) => (
                <img
                  src="pint.png"
                  alt="Pint"
                  width={60}
                  height={60}
                  key={i}
                  style={{ opacity: p.end ? "1" : "0.2" }}
                />
              ))}
            </div>
          </div>
          <div className={styles.inputGroup}>
            <Button onClick={nextPint} variant="contained" color="success">Finish Pint</Button>
          </div>
        </>
      ) : (
        <div className={styles.splash}>
          <Button onClick={startSess} variant="contained" color="info">Start Session</Button>
        </div>
      )}
    </main>
  )
}