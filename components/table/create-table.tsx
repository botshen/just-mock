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
    const finalCellClass = computed(() => mc('flex items-center  xxx max-w-full', props.cellClass))
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
                <div class=" text-gray-800 flex justify-center items-center  ">
                  <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3128" width="100" height="100">
<path d="M106.97251697 619.07623114h289.80414734c11.63872078 0 21.53163343 9.89291266 21.53163343 21.53163345 0 51.21037142 40.73552271 91.3639581 92.52783018 91.3639581s92.52783017-40.15358668 92.52783018-91.3639581c0-11.63872078 9.89291266-21.53163343 21.53163344-21.53163345h288.05833923c8.72904058 0 16.29420908 5.23742435 19.78582532 12.80259287-4.65548831-15.71227305-12.80259285-32.00648214-13.96646493-34.3342263 0-0.58193603-0.58193603-0.58193603-0.58193604-0.58193603l-92.52783018-146.6478818c0-0.58193603-0.58193603-0.58193603-0.58193605-1.16387207-1.74580811-1.74580811-15.71227305-19.78582532-32.00648212-29.09680195-16.87614513-9.89291266-40.15358668-11.63872078-43.06326688-11.63872078h-494.64563303c-4.07355227 0-23.8593776 0.58193603-39.57165064 9.89291266-15.71227305 9.89291266-27.35099383 26.76905779-28.5148659 28.51486591 0 0-0.58193603 0.58193603-0.58193603 1.16387208l-77.97942921 138.50077725c-2.32774415 3.49161624-9.89291266 16.87614513-16.29420909 37.82584251 4.07355227-2.9096802 8.72904058-5.23742435 14.54840098-5.23742435z" fill="#2C2C2C" p-id="3129"></path>
<path d="M937.3952444 670.28660257c0-1.74580811-1.16387208-16.87614513-4.07355228-31.4245461v2.32774415c0 11.63872078-9.31097662 21.53163343-21.53163344 21.53163343h-267.69057785l-2.90968021 11.05678476c-15.13033701 59.93941199-69.25038862 101.25687076-130.93560873 101.25687075-62.26715616 0-116.38720777-41.8993948-131.51754478-101.25687075l-2.9096802-11.05678476H106.39058092c-8.72904058 0-15.71227305-5.23742435-19.20388928-12.22065681-1.16387208 10.4748487-1.16387208 18.62195325-1.16387208 22.11356949v157.12273048c0 2.9096802 1.74580811 26.76905779 18.62195325 42.48133083 16.87614513 15.71227305 43.64520291 16.87614513 46.5548831 16.87614514h1.16387208-0.58193603 715.78132778c5.23742435 0 31.4245461-0.58193603 49.46456329-16.87614514 18.0400172-16.29420908 19.20388928-38.40777856 19.2038893-44.80907498l1.16387207-157.12273049zM509.0903198 348.47597308c-16.29420908 0-29.67873798-13.3845289-29.67873798-29.67873798V148.87191176c0-16.29420908 13.3845289-29.67873798 29.67873798-29.67873798s29.67873798 13.3845289 29.67873799 29.67873798v170.50725939c0 16.29420908-13.3845289 29.09680195-29.67873799 29.09680193z m198.44018926-1.16387207c-16.29420908 0-29.67873798-13.3845289-29.67873798-29.67873799 0-6.98323246 2.32774415-13.3845289 6.40129642-18.62195323l67.5045805-83.21685357c5.81936038-6.98323246 13.96646493-11.05678473 23.27744156-11.05678473 6.98323246 0 13.3845289 2.32774415 18.62195324 6.40129643 6.40129643 4.65548831 9.89291266 12.22065682 11.05678474 19.78582531 0.58193603 7.56516851-1.74580811 15.71227305-6.40129642 21.53163344l-67.50458051 83.21685356c-5.81936038 8.14710455-13.96646493 12.22065682-23.27744155 11.63872078z m-393.38876226-1.74580812c-8.72904058 0-17.45808117-4.07355227-23.27744156-11.05678474l-66.34070843-83.7987896c-9.89291266-12.80259285-8.14710455-31.4245461 4.65548831-41.89939479 5.23742435-4.07355227 11.63872078-6.40129643 18.62195325-6.40129643 9.31097662 0 17.45808117 4.07355227 23.27744155 11.05678474l66.34070843 83.79878959c9.89291266 12.80259285 8.14710455 31.4245461-4.65548831 41.8993948-5.23742435 4.07355227-12.22065682 6.40129643-18.62195324 6.40129643z" fill="#2C2C2C" p-id="3130"></path>
                  </svg>
                </div>
              )
          }
          {props.loading
            ? (
              <div class="text-center py-8 flex justify-center items-center border border-gray-100 rounded-lg absolute top-0 left-0 w-full h-full bg-white">
                <div class="w-6 h-6 border-1 border-[#464b65] border-t-white rounded-full animate-spin" />
              </div>
            )
            : null}
        </div>
      </MergeClass>

    )
  })
}
