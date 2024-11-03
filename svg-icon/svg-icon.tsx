 import { SVGAttributes } from 'vue'
import { createComponent } from '@/share/create-component'
import { mc } from '@/share/ui-helper'
type ClassName = string | string[] | object | null | false | undefined | 0
interface Props {
  name: string
  class?: ClassName
  colored?: boolean
}


export const SvgIcon = createComponent<{ props: Props }, SVGAttributes>(
  {
    props: {
      name: '',
      class: '',
      colored: false,
    },
    inheritAttrs: false,
  },
  (props, context) => {
    return () => (
      <svg {...context.attrs} class={mc('size-[1.1em] align-middle fill-current', props.class)}>
        <use xlinkHref={props.colored ? `#${props.name}-colored` : `#${props.name}`} />
      </svg>
    )
  },
)
