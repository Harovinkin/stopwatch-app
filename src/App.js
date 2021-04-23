import React, { useEffect, useState } from "react";
import { interval, Subject } from "rxjs";
import { takeUntil, map, filter, buffer, debounceTime, repeatWhen } from "rxjs/operators";

const START = 'start';
const STOP ='stop';


const click$ = new Subject();

const doubleClick$ = click$.pipe(
  buffer(
    click$.pipe(debounceTime(300))
  ),
  map(list => {
    return list.length;
  }),
  filter(x => x === 2),
)

const action$ = new Subject();

const stop$ = action$.pipe(filter(action => action === STOP));
const start$ = action$.pipe(filter(action => action === START));

const countUp$ = interval(1000).pipe(
takeUntil(stop$),
takeUntil(doubleClick$),
repeatWhen(() => start$),
)


export default function App() {
const [counter, setCounter] = useState(0);
const [startActive, setStartActive] = useState(true);

useEffect(() => {
  const sub = countUp$.subscribe(val => setCounter(prev => prev + 1000));
  action$.next(STOP);

  return () => sub.unsubscribe()
}, [])

const handleStart = () => {
  action$.next(START);
  setStartActive(prev => !prev)
}


const handleStop = () => {
  action$.next(STOP);
  setCounter(0)
  setStartActive(prev => !prev)
}

const handleWait = () => {
  doubleClick$.next()
  setStartActive(true)
}

const handleReset = () => {
  setCounter(0)
}


return (
  <div className='container'>
    <h1>{new Date(counter).toISOString().slice(11, 19)}</h1>
    <div className='btn-wrapper'>
    {startActive
      ? (<button className='start' onClick={handleStart}>Start</button>)
      : (<button className='stopt' onClick={handleStop}>Stop</button>)
    }
    <button className='wait' onClick={handleWait}>Wait</button>
    <button className='reset' onClick={handleReset}>Reset</button>
    </div>
  </div>
)
}