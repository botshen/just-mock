import type { RerouteRule } from '@/utils/service'
import clearIcon from '@/assets/delete.svg'
import { createComponent } from '@/share/create-component'
import { createNanoId } from '@/share/id-helper'
import { onMounted, ref } from 'vue'

export const ReroutePage = createComponent(null, () => {
  const { t } = i18n
  const rules = ref<RerouteRule[]>([])

  // 添加新规则
  const addNewRule = async () => {
    const newRule: RerouteRule = {
      id: createNanoId(),
      actionType: 'REROUTE',
      comment: '',
      enabled: false,
      rerouteUrl: 'https://model.sankuai.com/$1',
      url: 'http://localhost:8081/(.*)',
      urlType: 'REGEX',
    }
    const rerouteRepo = getRerouteRepo()
    await rerouteRepo.create(newRule)
    rules.value = await rerouteRepo.getAll()
  }

  // 删除规则
  const removeRule = async (id: string) => {
    const rerouteRepo = getRerouteRepo()
    await rerouteRepo.delete(id)
    rules.value = await rerouteRepo.getAll()
  }

  // 更新规则启用状态
  const toggleRuleStatus = async (id: string) => {
    const rule = rules.value.find(r => r.id === id)
    if (!rule)
      return
    rule.enabled = !rule.enabled
    const rerouteRepo = getRerouteRepo()
    await rerouteRepo.update(rule)
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
    <div class="m-2">
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div>
          {rules.value.length === 0
            ? (
              <div class="text-center py-8 text-gray-500">
                <span>暂无重定向规则，请点击"添加规则"按钮创建</span>
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
                          onChange={() => toggleRuleStatus(rule.id)}
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
                </div>
              ))
            )}
        </div>
        <div class="flex justify-between mb-4">
          <button class="btn btn-square btn-sm" onClick={addNewRule}>
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
    </div>
  )
})
