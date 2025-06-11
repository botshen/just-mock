import type { LogRule } from '../store/use-logs-store'
import { Button2 } from '@/components/button/button'
import { Form, FormItem } from '@/components/form/form'
import { useLogsStore } from '@/entrypoints/sidepanel/modules/store/use-logs-store'
import { createComponent } from '@/share/create-component'
import { tryParseJson } from '@/share/inject-help'
import { sendMessage } from '@/utils/messaging'
import { getTodosRepo } from '@/utils/service'
import { createJSONEditor } from 'vanilla-jsoneditor'
import { useRouter } from 'vue-router'
import './json.css'

export const LogDetail = createComponent(null, () => {
  const { formData } = useLogsStore()
  const router = useRouter()
  const jsonEditorContainer = ref<HTMLDivElement>()
  const payloadEditorContainer = ref<HTMLDivElement>()
  const editor = ref<any>(null)
  const responseEditor = ref<any>(null)
  const { t } = i18n
  onMounted(() => {
    if (jsonEditorContainer.value) {
      responseEditor.value = createJSONEditor({
        target: jsonEditorContainer.value,
        props: {
          mode: 'text',
          showEditor: true,
          readOnly: false,
          content: {
            json: formData.value.response ? tryParseJson(formData.value.response, {}) : {},
            text: undefined,
          },
          onChange: (updatedContent: any) => {
            if (updatedContent.json) {
              formData.value.response = JSON.stringify(updatedContent.json)
            }
            else if (updatedContent.text) {
              formData.value.response = updatedContent.text
            }
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
            json: formData.value.payload ? tryParseJson(formData.value.payload, {}) : {},
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
    if (responseEditor.value) {
      responseEditor.value.destroy()
    }
  })

  const onSubmit = async () => {
    if (responseEditor.value) {
      const content = responseEditor.value.get()
      if (content.json) {
        formData.value.response = JSON.stringify(content.json)
      }
      else if (content.text) {
        formData.value.response = content.text
      }
    }

    const newRule: LogRule = {
      id: formData.value.url,
      url: formData.value.url,
      status: formData.value.status,
      mock: formData.value.mock || 'mock',
      payload: '',
      type: formData.value.type,
      delay: formData.value.delay,
      response: formData.value.response,
      comments: formData.value.comments,
      active: formData.value.active,
    }
    const todosRepo = getTodosRepo()
    await todosRepo.update(newRule)

    // 更新mock规则后重新检查当前标签页
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabs[0]?.id) {
      await sendMessage('activateCurrentTab', tabs[0].id)
    }
    router.back()
  }

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

  return () => (
    <div class="p-8 bg-white">

      <Form class="space-y-2" onSubmit={onSubmit}>

        <div class="flex justify-between items-center  ">
          <div class="flex items-center gap-2">
            <label class="font-bold">{t('switch')}</label>
            <input
              type="checkbox"
              class="toggle"
              checked={formData.value.active}
              onChange={(e) => {
                if (e && e.target && 'checked' in e.target) {
                  formData.value.active = (e.target as HTMLInputElement).checked
                }
              }}
            />
          </div>
          <div class="flex gap-2">
            <Button2
              width="fit"
              type="submit"
              onClick={() => {
                router.back()
              }}
            >
              {t('back')}
            </Button2>
            <Button2 level="important" width="fit" type="submit">{t('submit')}</Button2>
          </div>
        </div>
        <FormItem
          formItemClass="mb-4"
          type="text"
          placeholder={t('path')}
          label={t('path')}
          class="w-full h-8"
          v-model={formData.value.url}
        />
        <div class="grid grid-cols-2 gap-4">
          <FormItem
            formItemClass="mb-4"
            type="select"
            placeholder={t('method')}
            label={t('method')}
            class="w-full h-8"
            search
            v-model={formData.value.type}
            options={methodOptions.value}
            onClear={() => formData.value.type = ''}
          />
          <FormItem
            formItemClass="mb-4"
            type="select"
            placeholder={t('statusCode')}
            label={t('statusCode')}
            class="w-full h-8"
            search
            v-model={formData.value.status}
            options={codeOptions.value}
            onClear={() => formData.value.status = ''}
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <FormItem
            formItemClass="mb-4"
            type="text"
            placeholder={t('delay')}
            label={t('delay')}
            class="w-full h-8"
            v-model={formData.value.delay}
          />
          <FormItem
            formItemClass="mb-4"
            type="text"
            placeholder={t('comment')}
            label={t('comment')}
            class="w-full h-8"
            v-model={formData.value.comments}
          />

        </div>
        {
          formData.value.payload && (
            <FormItem label={t('requestBody')} class="min-h-[100px]" type="slot">
              <div ref={payloadEditorContainer} class="w-full !max-h-[400px] jse-theme-light"></div>
            </FormItem>
          )
        }
        <FormItem label={t('response')} class="min-h-[80px]" type="slot">
          <div ref={jsonEditorContainer} class="w-full !max-h-[400px] jse-theme-light"></div>
        </FormItem>

      </Form>
    </div>

  )
})
