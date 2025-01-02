import type { ClassName } from '@/share/typings'
import { Button2 } from '@/components/button/button'
import { Form, FormItem } from '@/components/form/form'
import { createComponent, fn, required } from '@/share/create-component'

interface Options {
  props: {
    class?: ClassName
  }
  emits: {
    edit: () => void
    close: () => void
  }
}
export const Detail = createComponent<Options>({
  props: {
    class: '',
  },
  emits: {
    edit: fn,
    close: fn,
  },
}, (props, { emit }) => {
  const onSubmit = () => {
    console.log('onSubmit')
  }
  const formData = ref({
    dataSpace: '',
    data_value: '',

  })
  const dataSpaceOptions = ref([{
    label: 'dataSpace',
    value: 'dataSpace',
  }, {
    label: 'dataSpace2',
    value: 'dataSpace2',
  }])
  const errors = ref({
    dataSpace: [],
    data_value: [],

  })
  return () => (
    <div class="p-8 w-[100vw] h-[100vh] bg-white">
      <div class="dialog-header">
        <h3 class="text-sm font-bold text-[#999] absolute left-4 top-4">DETAIL</h3>
      </div>
      <Form class="space-y-2 mt-4" onSubmit={onSubmit}>
        <FormItem error={errors.value.data_value[0]} label="Data Value" class="min-h-[80px]" type="textarea" v-model={formData.value.data_value} />
        <FormItem
          formItemClass="mb-4"
          error={errors.value.dataSpace?.[0]}
          type="select"
          placeholder="Data Space"
          label="Work Space"
          class="w-64"
          search
          v-model={formData.value.dataSpace}
          options={dataSpaceOptions.value}

        />
        <div class="flex justify-end mt-8 gap-2">
          <Button2 width="fit" type="submit" class="px-8 py-2" onClick={() => emit('close')}>BACK</Button2>
          <Button2 class="px-8 py-2" level="important" width="fit" type="submit">SUBMIT</Button2>
        </div>
      </Form>
    </div>

  )
})
