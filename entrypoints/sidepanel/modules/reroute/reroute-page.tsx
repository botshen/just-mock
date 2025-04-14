import type { RerouteRule } from '@/utils/service'
import clearIcon from '@/assets/delete.svg'
import { Button2 } from '@/components/button/button'
import { openDialog } from '@/components/dialog/open-dialog'
import { createComponent } from '@/share/create-component'
import { createNanoId } from '@/share/id-helper'
import { onMounted, ref } from 'vue'
import { useMockStore } from '../header/use-mock-store'
import { RuleConfigDialog } from './rule-config-dialog'
import { useRerouterStore } from './use-rerouter-store'

export const ReroutePage = createComponent(null, () => {
  const { t } = i18n
  const rules = ref<RerouteRule[]>([])
  const { globalMocked } = useMockStore()
  const { showModal } = useRerouterStore()
  // 添加新规则
  const addReRouteRule = async () => {
    // 获取当前活跃标签页，而不是使用getCurrent
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const currentTab = tabs[0]
    const currentTabDomain = currentTab?.url?.split('://')[1]?.split('/')[0]

    // 转义域名中的点号，将其替换为 \. 以便在正则表达式中正确匹配
    const escapedDomain = currentTabDomain ? currentTabDomain.replace(/\./g, '\\.') : 'localhost:8081'

    const newRule: RerouteRule = {
      id: createNanoId(),
      actionType: 'REROUTE',
      comment: '',
      enabled: true,
      url: currentTabDomain ? `https://${escapedDomain}/(.*)` : 'http://localhost:8081/(.*)',
      rerouteUrl: `http://localhost:3000/$1`,
      urlType: 'REGEX',
    }
    await sendMessage('activateAllDebugger', undefined)
    const rerouteRepo = getRerouteRepo()
    await rerouteRepo.create(newRule)
    rules.value = await rerouteRepo.getAll()
  }
  const addReplayRule = async () => {
    // 获取当前活跃标签页，而不是使用getCurrent
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const currentTab = tabs[0]
    const currentTabDomain = currentTab?.url?.split('://')[1]?.split('/')[0]

    // 转义域名中的点号，将其替换为 \. 以便在正则表达式中正确匹配
    const escapedDomain = currentTabDomain ? currentTabDomain.replace(/\./g, '\\.') : 'localhost:8081'

    const newRule: RerouteRule = {
      id: createNanoId(),
      actionType: 'REPLAY',
      comment: '',
      enabled: true,
      url: currentTabDomain ? `https://${escapedDomain}/(.*)` : 'http://localhost:8081/(.*)',
      urlType: 'REGEX',
    }
    await sendMessage('activateAllDebugger', undefined)
    const rerouteRepo = getRerouteRepo()
    await rerouteRepo.create(newRule)
    rules.value = await rerouteRepo.getAll()
  }
  // 检查是否需要停用调试器
  const checkAndDeactivateDebuggerIfNeeded = async () => {
    if (rules.value.every(rule => !rule.enabled)) {
      const todosRepo = getTodosRepo()
      const allTodos = await todosRepo.getAll()
      if (allTodos.length === 0 || allTodos.every(todo => !todo.active)) {
        await sendMessage('deactivateAllDebugger', undefined)
      }
    }
  }

  // 删除规则
  const removeRule = async (id: string) => {
    const rerouteRepo = getRerouteRepo()
    await rerouteRepo.delete(id)
    rules.value = await rerouteRepo.getAll()
    await checkAndDeactivateDebuggerIfNeeded()
  }

  // 更新规则启用状态
  const toggleRuleStatus = async (e: Event, id: string) => {
    const isChecked = (e.target as HTMLInputElement).checked
    const rule = rules.value.find(r => r.id === id)
    if (!rule)
      return
    rule.enabled = isChecked
    const rerouteRepo = getRerouteRepo()
    await rerouteRepo.update(rule)
    if (isChecked) {
      await sendMessage('activateAllDebugger', undefined)
    }
    if (!isChecked) {
      await checkAndDeactivateDebuggerIfNeeded()
    }
  }

  // 更新规则字段
  const updateRuleField = async (id: string, field: 'url' | 'rerouteUrl', value: string) => {
    const rule = rules.value.find(r => r.id === id)
    if (!rule)
      return
    rule[field] = value
    const rerouteRepo = getRerouteRepo()
    await rerouteRepo.update(rule)
  }
  onMounted(async () => {
    const rerouteRepo = getRerouteRepo()
    const all = await rerouteRepo.getAll()
    rules.value = all
  })

  return () => (
    <div class={`m-2 ${!globalMocked.value ? 'opacity-50 pointer-events-none' : ''}`}>
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div>
          {rules.value.length === 0
            ? (
              <div class="text-center py-8 text-gray-500">
                <span>
                  {t('noRerouteTip')}
                </span>
              </div>
            )
            : (
              rules.value.map(rule => (
                <div key={rule.id} class="bg-base-200 p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                  <div class="form-control">
                    <label class="flex items-center justify-between mb-2">
                      <span class="label-text">匹配规则（正则表达式）</span>
                      <x-action class="flex items-center h-full">
                        <input
                          type="checkbox"
                          class="toggle toggle-sm mr-2"
                          checked={rule.enabled}
                          onChange={e => toggleRuleStatus(e, rule.id)}
                        />
                        <button
                          class="text-error"
                          onClick={() => removeRule(rule.id)}
                        >
                          <img src={clearIcon} class="w-4 h-4" />
                        </button>
                      </x-action>
                    </label>

                    <input
                      type="text"
                      class="input input-bordered w-full input-sm"
                      placeholder="例如: https://www\.example\.com/(.*)"
                      value={rule.url}
                      onInput={e => updateRuleField(rule.id, 'url', (e.target as HTMLInputElement).value)}
                    />
                  </div>

                  {rule.actionType === 'REROUTE' && (
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">重定向到</span>
                      </label>
                      <input
                        type="text"
                        class="input input-bordered w-full input-sm"
                        placeholder="例如: http://localhost:3000/$1"
                        value={rule.rerouteUrl}
                        onInput={e => updateRuleField(rule.id, 'rerouteUrl', (e.target as HTMLInputElement).value)}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
        </div>
        <div class="flex justify-between mb-4">
          <button
            class="btn btn-square btn-sm"
            onClick={() => {
              showModal()
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v12M6 12h12"
              />
            </svg>
          </button>
        </div>
      </div>
      <RuleConfigDialog
        onSelectOption={(option) => {
          if (option === 'reroute') {
            addReRouteRule()
          }
          else if (option === 'replay') {
            addReplayRule()
          }
        }}
      />
    </div>
  )
})
