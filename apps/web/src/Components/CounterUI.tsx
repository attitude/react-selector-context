import { Dispatch, SetStateAction, useCallback } from 'react'
import { useRenderCount } from '../Hooks'
import { RenderedDiv } from './RenderedDiv'

export function CounterUI({ action, label, value }: {
  action: Dispatch<SetStateAction<number>>;
  label: string;
  value: number;
}) {
  return (
    <RenderedDiv at={Date.now()} className="vertical-stack gap border box-radius box-padding">
      <div className="horizontal-stack align-center justify-space-between gap">
        {label}: {value}
        <button
          className="padding border border-radius"
          onClick={useCallback(() => {
            action(value => value + 1)
          }, [action])}
        >Increase counter</button>
      </div>
      Rendered: {useRenderCount()}&times;
    </RenderedDiv>
  )
}
