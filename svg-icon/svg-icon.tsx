 import { SVGAttributes } from 'vue'
 import { twJoin, twMerge } from 'tailwind-merge' 
import { createComponent } from '@/share/create-component'
type ClassName = string | string[] | object | null | false | undefined | 0
interface Props {
  name: string
  class?: ClassName
  colored?: boolean
}
const rules = [
  /^text-shadow-(.*?)$/,
  /^grid-areas-(.*?)$/,
  /^grid-in-(.*?)$/,
]
const _mergeClass = (_left: ClassName, _right: ClassName) => {
  const leftParts = twJoin(_left).split(' ').filter(item => !item.match(/\s+/g))
  const rightParts = twJoin(_right).split(' ').filter(item => !item.match(/\s+/g))
  rules.forEach((rule: RegExp) => {
    leftParts.forEach((left, index) => {
      const matched = left.match(rule)
      if (matched) {
        const found = rightParts.find(right => right.match(rule))
        if (found) leftParts[index] = ''
      }
    })
  })
  return twMerge(leftParts.filter(Boolean).join(' '), rightParts.join(' '))
}
/**
 * @alias mc
 */
export const mergeClass = (...classes: ClassName[]) => {
  // 从后往前，使用 mergeClass两两合并
  return classes.reduceRight((prev, current) => _mergeClass(current, prev), '')
}
export const mc = mergeClass

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
