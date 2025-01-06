import type { ClassName } from '@/share/typings'
import { Button2 } from '@/components/button/button'
import { Form, FormItem } from '@/components/form/form'
import { useLogsStore } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import { createComponent, fn } from '@/share/create-component'
import { createJSONEditor } from 'vanilla-jsoneditor'
import { useRouter } from 'vue-router'
import { addDataPoolSchema } from './log-validator'

export const LogDetail = createComponent(null, () => {
  const { formData } = useLogsStore()

  const onSubmit = () => {
    errors.value = {
      url: [],
      method: [],
      code: [],
      Delay: [],
      response: [],
      comments: [],
    }
    if (!validateForm()) {
      return
    }
    console.log('onSubmit')
  }

  const jsonEditorContainer = ref<HTMLDivElement>()
  const payloadEditorContainer = ref<HTMLDivElement>()
  const editor = ref<any>(null)
  const router = useRouter()
  onMounted(() => {
    if (jsonEditorContainer.value) {
      editor.value = createJSONEditor({
        target: jsonEditorContainer.value,
        props: {
          mode: 'text',
          showEditor: true,
          readOnly: false,
          content: {
            json: formData.value.response ? JSON.parse(formData.value.response) : {},
            text: undefined,
          },
        },
      })
    }
    if (payloadEditorContainer.value) {
      editor.value = createJSONEditor({
        target: payloadEditorContainer.value,
        props: {
          mode: 'text',
          showEditor: false,
          readOnly: true,
          content: {
            json: formData.value.payload ? JSON.parse(formData.value.payload) : {},
            text: undefined,
          },
        },
      })
    }
  })

  onBeforeUnmount(() => {
    if (editor.value) {
      editor.value.destroy()
    }
  })

  const codeOptions = ref([{
    label: '200 OK',
    value: '200',
  }, {
    label: '201 Created',
    value: '201',
  }, {
    label: '204 No Content',
    value: '204',
  }, {
    label: '400 Bad Request',
    value: '400',
  }, {
    label: '401 Unauthorized',
    value: '401',
  }, {
    label: '403 Forbidden',
    value: '403',
  }, {
    label: '404 Not Found',
    value: '404',
  }, {
    label: '500 Internal Server Error',
    value: '500',
  }, {
    label: '502 Bad Gateway',
    value: '502',
  }, {
    label: '503 Service Unavailable',
    value: '503',
  }])
  const methodOptions = ref([{
    label: 'GET',
    value: 'GET',
  }, {
    label: 'POST',
    value: 'POST',
  }, {
    label: 'PUT',
    value: 'PUT',
  }, {
    label: 'DELETE',
    value: 'DELETE',
  }])
  const validateForm = () => {
    const result = addDataPoolSchema.safeParse(formData.value)

    if (!result.success) {
      result.error.issues.forEach((error) => {
        const path = error.path[0] as keyof typeof formData.value
        errors.value[path].push(error.message)
      })
      return false
    }
    return true
  }
  const errors = ref<Record<string, string[]>>({
    code: [],
    pathRule: [],
    method: [],
    delay: [],
    response: [],
    comments: [],
  })
  return () => (
    <div class="p-8 bg-white">
      <div class="dialog-header">
        <h3 class="text-sm font-bold text-[#999] absolute left-4 top-4">DETAIL</h3>
      </div>
      <Form class="space-y-2 mt-4" onSubmit={onSubmit}>
        <FormItem
          formItemClass="mb-4"
          error={errors.value.pathRule?.[0]}
          type="text"
          placeholder="Path Rule"
          label="Path Rule"
          class="w-full h-8"
          v-model={formData.value.url}
        />
        <div class="grid grid-cols-2 gap-4">
          <FormItem
            formItemClass="mb-4"
            error={errors.value.method?.[0]}
            type="select"
            placeholder="Method"
            label="Method"
            class="w-full h-8"
            search
            v-model={formData.value.method}
            options={methodOptions.value}
          />
          <FormItem
            formItemClass="mb-4"
            error={errors.value.code?.[0]}
            type="select"
            placeholder="Code"
            label="Code"
            class="w-full h-8"
            search
            v-model={formData.value.code}
            options={codeOptions.value}
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <FormItem
            formItemClass="mb-4"
            error={errors.value.delay?.[0]}
            type="text"
            placeholder="Delay"
            label="Delay"
            class="w-full h-8"
            v-model={formData.value.delay}
          />
          <FormItem
            formItemClass="mb-4"
            type="text"
            placeholder="Comments"
            label="Comments"
            class="w-full h-8"
            v-model={formData.value.comments}
          />

        </div>
        <FormItem label="Payload" class="min-h-[80px]" type="slot">
          <div ref={payloadEditorContainer} class="w-full max-h-[400px]"></div>
        </FormItem>
        <FormItem error={errors.value.response[0]} label="Response" class="min-h-[80px]" type="slot">
          <div ref={jsonEditorContainer} class="w-full max-h-[400px]"></div>
        </FormItem>
        <div class="flex justify-end mt-8 gap-2">
          <Button2
            width="fit"
            type="submit"
            class="px-8 py-2"
            onClick={() => {
              router.back()
            }}
          >
            BACK
          </Button2>
          <Button2 class="px-8 py-2" level="important" width="fit" type="submit">SUBMIT</Button2>
        </div>
      </Form>
    </div>

  )
})
