"use client"; // This is a client component 👈🏽

import styles from './page.module.css'
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import WarningIcon from '@mui/icons-material/Warning';

export default function Index() {
  const [pph, setPph] = useState();
  const [pints, setPints] = useState();
  const [elapsed, setElapsed] = useState();
  const [elapsedPint, setElapsedPint] = useState();
  const [elapsedString, setElapsedString] = useState();
  const [lastPintTime, setLastPintTime] = useState();
  const [currentPintTime, setCurrentPintTime] = useState();
  const [warning, setWarning] = useState();
  const [bestPintTime, setBestPintTime] = useState();
  const [paused, setPaused] = useState();
  const [running, setRunning] = useState();
  const [stamps, setStamps] = useState();
  const [pintStamps, setPintStamps] = useState();

  useEffect(() => {
    console.log('writing to storage');
    if (elapsed) localStorage.setItem('elapsed', elapsed);
    if (elapsedPint) localStorage.setItem('elapsedPint', elapsedPint);
    if (elapsedString) localStorage.setItem('elapsedString', elapsedString);
    if (lastPintTime) localStorage.setItem('lastPintTime', lastPintTime);
    if (currentPintTime) localStorage.setItem('currentPintTime', currentPintTime);
    if (bestPintTime) localStorage.setItem('bestPintTime', bestPintTime);
    if (pph) localStorage.setItem('pph', pph);
    if (pints) localStorage.setItem('pints', JSON.stringify(pints));
    if (stamps) localStorage.setItem('stamps', JSON.stringify(stamps));
    if (pintStamps) localStorage.setItem('pintStamps', JSON.stringify(pintStamps));
    if (paused != null) localStorage.setItem('paused', paused);
    if (running != null) localStorage.setItem('running', running);
    if (warning != null) localStorage.setItem('warning', warning);
  });

  useEffect(() => {
    console.log('loading from storage');
    setPph(localStorage.getItem('pph') || null);
    setElapsedString(localStorage.getItem('elapsedString') || '00:00:00');
    setElapsed(localStorage.getItem('elapsed') ? parseInt(localStorage.getItem('elapsed')) : null);
    setElapsedPint(localStorage.getItem('elapsedPint') ? parseInt(localStorage.getItem('elapsedPint')) : null);
    setLastPintTime(localStorage.getItem('lastPintTime') || null);
    setCurrentPintTime(localStorage.getItem('currentPintTime') || '00:00');
    setBestPintTime(localStorage.getItem('bestPintTime') || null);
    setPints(localStorage.getItem('pints') ? JSON.parse(localStorage.getItem('pints')) : []);
    setStamps(localStorage.getItem('stamps') ? JSON.parse(localStorage.getItem('stamps')) : []);
    setPintStamps(localStorage.getItem('pintStamps') ? JSON.parse(localStorage.getItem('pintStamps')) : []);
    setPaused(localStorage.getItem('paused') === 'true');
    setRunning(localStorage.getItem('running') === 'true');
    setWarning(localStorage.getItem('warning') === 'true');
  }, []);

  useEffect(()=> {
    let intervalId = setInterval(() => {
      if (paused) return;
      setElapsed(reduceStamps(stamps));
      setElapsedPint(reduceStamps(pintStamps));
    }, 1000);
    return () => clearInterval(intervalId); 
  }, [paused, pints, elapsed]);

  useEffect(() => {
    if (lastPintTime && currentPintTime) {
      setWarning(currentPintTime > lastPintTime);
    }(currentPintTime > lastPintTime)
  }, [lastPintTime, currentPintTime]);

  useEffect(() => {
    if (elapsed && pints.length > 0) {
      let hour = 3600000;
      if (pints.length > 1) {
        setPph(((pints.length-1) * (hour / elapsed)).toFixed(2));
      }

      const elapsedDate = new Date(null);
      elapsedDate.setSeconds(elapsed/1000);
      setElapsedString(elapsedDate.toISOString().slice(11, 19));

      const pintDate = new Date(null);
      pintDate.setSeconds(elapsedPint / 1000);
      setCurrentPintTime(pintDate.toISOString().slice(14, 19));
    }
  }, [elapsed, pints, elapsedPint]);

  const startSess = () => {
    localStorage.removeItem('elapsed');
    localStorage.removeItem('elapsedPint');
    localStorage.removeItem('elapsedString');
    localStorage.removeItem('lastPintTime');
    localStorage.removeItem('currentPintTime');
    localStorage.removeItem('bestPintTime');
    localStorage.removeItem('pph');
    localStorage.removeItem('pints');
    localStorage.removeItem('stamps');
    localStorage.removeItem('pintStamps');
    localStorage.removeItem('paused');
    setPph(null);
    setElapsedString('00:00:00');
    setElapsed(null);
    setLastPintTime(null);
    setCurrentPintTime('00:00');
    setBestPintTime(null);
    setPints([]);
    setStamps([new Date()]);
    setPaused(false);
    setWarning(false);
    setRunning(true);
    startPint();
    setElapsed(0);
    setElapsedPint(0);
  }

  const reduceStamps = (stampList) => {
    let reduced = stampList.reduce((acc, curr, index, arr) => {
      if (index === 0) {
        return acc;
      } else if (index % 2 !== 0) {
        acc += (new Date(curr) - new Date(arr[index - 1]))
      }
      return acc;
    }, 0);
    return new Date() - new Date(stampList[stampList.length - 1]) + reduced;
  }

  const reset = () => {
    setRunning(false);
  }

  const nextPint = () => {
    if(paused) return;
    finishPint();
    startPint();
  }

  const startPint = () => {
    setPintStamps([new Date()]);
    setPints(prev => [...prev, {
      start: new Date(),
    }]);
  }

  const pause = () => {
    setPaused(true);
    setStamps(prev => [...prev, new Date()]);
    setPintStamps(prev => [...prev, new Date()]);
  }

  const resume = () => {
    setPaused(false);
    setStamps(prev => [...prev, new Date()]);
    setPintStamps(prev => [...prev, new Date()]);
  }

  const finishPint = () => {
    if( !bestPintTime ) {
      setBestPintTime(currentPintTime);
    } else {
      setBestPintTime(currentPintTime < bestPintTime ? currentPintTime : bestPintTime);
    }
    setLastPintTime(currentPintTime);
    setPints(prev => {
      prev[prev.length - 1].elapsed = elapsedPint;
      prev[prev.length - 1].end = new Date();
      return prev
    });
    setCurrentPintTime('00:00');
    setElapsedPint(0);
  }

  const warningIco = () => (<WarningIcon style={{ marginRight: '0.25rem', marginLeft: '0.25rem', color: 'darkorange', fontSize: '14px' }} />)

  const notBuiltForStags = () => (<span style={{ color: '#ed6c02' }}>Not built for stags</span>)
  const builtForStags = () => (<span style={{ color: '#2e7d32' }}>Built for stags</span>)

  return (
    <main className={styles.main}>
      { running === true && (
        <>
          <div className={styles.header}>
            {pph && pints && pints.length > 1 && <h1>{pph} PPH</h1>}
          </div>
          <div className={styles.meta}>
            <div>
              {lastPintTime && <h4><span>Classification:</span> {warning ? notBuiltForStags() : builtForStags() } </h4>}
            </div>
            <div style={{ opacity: paused ? '0.4' : '1', marginTop: '0.5rem' }}>
              {bestPintTime && <h4><span>Best pint:</span> {bestPintTime}</h4>}
              {lastPintTime && <h4><span>Last pint:</span> {lastPintTime}</h4>}
              {currentPintTime && 
                <h4>
                  {warning && warningIco()}
                  <span>Current pint:</span>
                  {currentPintTime}
                  {warning && warningIco()}
                </h4>
              }
              <h4><span>Pints finished:</span> {pints.length - 1}</h4>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <Button onClick={reset} variant="text" color="info">Reset</Button>
              {!paused && <Button onClick={pause} variant="text" color="warning">Pause</Button>}
              {paused && <Button onClick={resume} variant="text" color="success">Resume</Button>}
            </div>
            <div className={styles.pints} style={{ opacity: paused ? '0.4' : '1' }}>
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
          <div className={styles.inputGroup} style={{ opacity: paused ? '0.4' : '1' }}>
            <Button onClick={nextPint} variant="contained" color="success">Finish Pint</Button>
          </div>
        </>
      )}
      {running === false && (
        <div className={styles.splash}>
          <img
            src="pint.png"
            alt="Pint"
            width={100}
            height={100}
            style={{marginBottom: '2rem'}}
          />
          <Button onClick={startSess} variant="contained" color="info">Start Session</Button>
        </div>
      )}
    </main>
  )
}