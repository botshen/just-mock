import { createComponent } from '@/share/create-component'

export const SettingsPage = createComponent(null, () => {
  const { t } = i18n
  return () => (
    <div class="m-2">
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">{t('totalSwitch')}</span>
          <input type="checkbox" class="toggle" checked={true} />
        </label>
        <label class="label cursor-pointer">
          <span class="label-text">{t('interceptSuccess')}</span>
          <input type="checkbox" class="toggle" checked={true} />
        </label>
        <label class="label cursor-pointer">
          <span class="label-text">{t('consoleLog')}</span>
          <input type="checkbox" class="toggle" checked={true} />
        </label>
        <label class="label cursor-pointer">
          <span class="label-text">{t('interceptSuccessTip')}</span>
          <input type="checkbox" class="toggle" checked={true} />
        </label>
      </div>
    </div>
  )
})
