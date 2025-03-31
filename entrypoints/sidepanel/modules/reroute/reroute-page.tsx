import clearIcon from '@/assets/delete.svg'
import { createComponent } from '@/share/create-component'
import { onMounted, ref } from 'vue'

interface RerouteRule {
  id: string
  source: string
  target: string
  enabled: boolean
}

export const ReroutePage = createComponent(null, () => {
  const { t } = i18n
  const rules = ref<RerouteRule[]>([])

  // 从存储中加载规则
  const loadRules = async () => {
    try {
      // 实际实现时应该从浏览器存储获取
      // const storedRules = await sendMessage('getRerouteRules', undefined)
      // 这里用模拟数据
      rules.value = [
        {
          id: '1',
          source: 'http://localhost:8081/(.*)',
          target: ' https://model.sankuai.com/$1',
          enabled: true,
        },
      ]
    }
    catch (error) {
      console.error('加载重定向规则失败:', error)
    }
  }

  // 添加新规则
  const addNewRule = () => {
    const newRule: RerouteRule = {
      id: Date.now().toString(),
      source: '',
      target: '',
      enabled: true,
    }
    rules.value.push(newRule)
  }

  // 删除规则
  const removeRule = (id: string) => {
    rules.value = rules.value.filter(rule => rule.id !== id)
  }

  // 更新规则启用状态
  const toggleRuleStatus = (id: string) => {
    const rule = rules.value.find(r => r.id === id)
    if (rule) {
      rule.enabled = !rule.enabled
    }
  }

  // 更新规则字段
  const updateRuleField = (id: string, field: 'source' | 'target', value: string) => {
    const rule = rules.value.find(r => r.id === id)
    if (rule) {
      rule[field] = value
    }
  }

  // 保存所有规则
  const saveRules = async () => {
    try {
      // 实际实现时应该保存到浏览器存储
      // await sendMessage('saveRerouteRules', { rules: rules.value })
    }
    catch (error) {
      console.error('保存重定向规则失败:', error)
    }
  }

  onMounted(async () => {
    await loadRules()
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
                    <label class=" flex items-center justify-between mb-2">
                      <span class="label-text">匹配规则（正则表达式）</span>
                      <x-action class="flex items-center h-full  ">
                        <input
                          type="checkbox"
                          class="toggle toggle-sm mr-2"
                          checked={rule.enabled}
                          onChange={() => toggleRuleStatus(rule.id)}
                        />
                        <button
                          class=" text-error"
                          onClick={() => removeRule(rule.id)}
                        >
                          <img src={clearIcon} class="w-4 h-4 " />
                        </button>
                      </x-action>

                    </label>

                    <input
                      type="text"
                      class="input input-bordered w-full input-sm"
                      placeholder="例如: https://www\.example\.com/(.*)"
                      value={rule.source}
                      onInput={e => updateRuleField(rule.id, 'source', (e.target as HTMLInputElement).value)}
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
                      value={rule.target}
                      onInput={e => updateRuleField(rule.id, 'target', (e.target as HTMLInputElement).value)}
                    />
                  </div>

                </div>
              ))
            )}
        </div>
        <div class="flex justify-between mb-4">

          <button class="btn btn-square  btn-sm" onClick={addNewRule}>
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
