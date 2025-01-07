import type { ClassName } from '@/share/typings'
import type { VNodeChild } from 'vue'
import { Button2 } from '@/components/button/button'
import { Checkbox } from '@/components/checkbox/checkbox'
import { createComponent } from '@/share/create-component'
import { MergeClass } from '@/share/merge-class'
import { mc } from '@/share/ui-helper'
import { difference, isEqual } from 'lodash-es'
import { computed } from 'vue'
import { useTableStore } from './use-table-store'

export type Column<D> = [
  name: string | VNodeChild | ((column: Column<D>, data: D[]) => VNodeChild),
  render: keyof D | ((row: D, rowIndex: number, data: D[]) => VNodeChild),
  {
    class?: ClassName | ((row: D, rowIndex: number, data: D[]) => ClassName)
    width?: 'max-content' | 'min-content' | 'auto' | 'minmax(min, max)' | 'fit-content(?)' | '1fr' | '100px' | '50%' | string
  },
] | [
  name: string | VNodeChild | ((column: Column<D>, data: D[]) => VNodeChild),
  render: keyof D | ((row: D, rowIndex: number, data: D[]) => VNodeChild),
]
interface TableOptions<D> {
  props: {
    store?: ReturnType<typeof useTableStore> | null
    list: D[] | null
    columns: Array<Column<D>>
    loading?: boolean
    expanded?: Record<string, boolean>
    actionsClass?: ClassName
    cellClass?: ClassName
    headCellClass?: ClassName
    multiSelect?: boolean
    leftActions?: (() => VNodeChild) | null
    rightActions?: (() => VNodeChild) | null
  }
}
function resolve<D extends { id: string }>(maybeString: string | VNodeChild | ((column: Column<D>, data: D[]) => VNodeChild), column: Column<D>, data: D[]) {
  return typeof maybeString === 'function' ? maybeString(column, data) : maybeString
}
export function CreateTable<D extends { id: string }>() {
  return createComponent<TableOptions<D>>({
    props: {
      list: null,
      store: null,
      columns: [],
      expanded: {},
      loading: false,
      cellClass: '',
      headCellClass: '',
      actionsClass: '',
      multiSelect: false,
      leftActions: null,
      rightActions: null,
    },
  }, (props, { slots }) => {
    const { selectedRowIds, mode } = props.store ?? useTableStore()
    const listIds = computed(() => props.list?.map(item => item.id) ?? [])

    const handleSelectAll = (value: boolean) => {
      if (!props.list)
        return
      selectedRowIds.value = value ? listIds.value : []
    }
    const handleSelectionChange = (row: D) => {
      if (selectedRowIds.value.includes(row.id)) {
        const index = selectedRowIds.value.indexOf(row.id)
        selectedRowIds.value.splice(index, 1)
      }
      else {
        selectedRowIds.value.push(row.id)
      }
    }
    const finalHeadCellClass = computed(() => mc('h-8 font-bold text-xs text-[#999] whitespace-nowrap max-w-full', props.cellClass, props.headCellClass))
    const finalCellClass = computed(() => mc('flex items-center py-2 max-w-full', props.cellClass))
    return () => (
      <MergeClass baseClass="block overflow-x-auto max-w-full break-all relative space-y-4">
        {(props.leftActions || props.rightActions || props.multiSelect) && (
          <MergeClass tag="x-table-actions" baseClass="flex" class={props.actionsClass}>
            {props.leftActions?.()}
            {props.multiSelect && (
              mode.value === 'normal'
                ? (
                  <Button2
                    level="text"
                    width="fit"
                    class="h-8 text-sm font-bold"
                    onClick={() => mode.value = 'select'}
                  >
                    MULTI SELECT
                  </Button2>
                )
                : (
                  <Button2
                    level="normal"
                    width="fit"
                    class="h-8 text-sm font-bold"
                    onClick={() => mode.value = 'normal'}
                  >
                    Cancel Select
                  </Button2>
                )
            )}
            {props.rightActions?.()}
          </MergeClass>
        )}
        <div class="relative min-h-[200px]">
          {
            props.list?.[0]
              ? (
                <x-table
                  class="overflow-x-auto w-full relative"
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      [mode.value === 'select' ? 'max-content' : '', ...props.columns.map(column => column[2]?.width ?? 'max-content')].join(' '),
                  }}
                >
                  {/* head */}
                  {/* <x-head class={mc('block', props.theadClass.value)}> */}
                  {/* <x-row class={mc(rowClass, props.rowClass)}> */}
                  {/* 全选 */}
                  {mode.value === 'select' && (
                    <x-cell role="head" class={mc(finalHeadCellClass.value, 'px-2 w-8 head')}>
                      <Checkbox
                        modelValue={isEqual(selectedRowIds.value, listIds.value)}
                        indeterminate={selectedRowIds.value.length > 0 && difference(listIds.value, selectedRowIds.value).length > 0}
                        onUpdate:modelValue={handleSelectAll}
                      />
                    </x-cell>
                  )}
                  {/* 表头 */}
                  {props.columns.map((column, index) => (
                    <x-cell
                      role="head"
                      class={mc(
                        column[2]?.class,
                        finalHeadCellClass.value,
                        'head',
                        // 根据不同情况添加圆角
                        mode.value !== 'select' && index === 0 ? 'rounded-l' : '',
                        index === props.columns.length - 1 ? 'rounded-r' : '',
                      )}
                    >
                      {resolve(column[0], column, props.list!)}
                    </x-cell>
                  ))}
                  {/* </x-row> */}
                  {/* </x-head> */}
                  {/* <x-body class={mc('block', props.tbodyClass)}> */}
                  {props.list.map((row, rowIndex) => (
                    <>
                      {/* <x-row class={mc(rowClass, props.rowClass)} key={row.id ?? rowIndex}> */}
                      {/* 勾选 */}
                      {mode.value === 'select' && (
                        <x-cell class={mc(
                          finalCellClass.value,
                          'w-8 px-2 py-4 whitespace-nowrap text-sm',
                          rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#f6f6f6]',
                        )}
                        >
                          <Checkbox
                            modelValue={selectedRowIds.value.includes(row.id)}
                            onUpdate:modelValue={() => handleSelectionChange(row)}
                          />
                        </x-cell>
                      )}
                      {/* 所有列 */}
                      {props.columns.map(column => (
                        <x-cell class={mc(
                          finalCellClass.value,
                          rowIndex % 2 === 0 ? 'bg-white' : 'bg-white',
                          typeof column[2]?.class === 'function' ? column[2].class(row, rowIndex, props.list!) : column[2]?.class,
                        )}
                        >
                          {typeof column[1] === 'function' ? column[1](row, rowIndex, props.list!) : row[column[1]]}
                        </x-cell>
                      ))}
                      {/* </x-row> */}
                      {props.expanded?.[row.id] && (
                        // <x-row class={mc(rowClass, 'block h-4', props.rowClass)} key={row.id ? `expanded-${row.id}` : `expanded-${rowIndex}`}>
                        <x-cell class={mc(finalCellClass.value)}>
                          展开内容
                        </x-cell>
                        // </x-row>
                      )}
                    </>
                  ))}
                  {/* </x-body> */}
                </x-table>
              )
              : !props.loading && (
                <div class=" text-red-800 text-center py-8">Data is empty.</div>
              )
          }
          {props.loading
            ? (
              <div class="text-center py-8 flex justify-center items-center border border-gray-100 rounded-lg absolute top-0 left-0 w-full h-full bg-white">
                <div class="w-6 h-6 border-2 border-[#464b65] border-t-white rounded-full animate-spin" />
              </div>
            )
            : null}
        </div>
      </MergeClass>

    )
  })
}
