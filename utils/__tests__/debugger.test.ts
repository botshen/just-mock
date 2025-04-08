import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  findMatchingRerouteRule,
  findMatchingRule,
  getDebuggerStatus,
  handleMockResponse,
} from '../debugger'

// Mock browser.runtime.getManifest
vi.mock('wxt/testing', () => {
  return {
    fakeBrowser: {
      runtime: {
        getManifest: () => ({
          manifest_version: 3,
          version: '1.0.0',
          name: 'Test Extension',
        }),
      },
      debugger: {
        sendCommand: () => Promise.resolve(),
      },
    },
  }
})

// Mock storage repositories
const mockGetAll = vi.fn()
vi.mock('@/utils/service', () => {
  return {
    getTodosRepo: () => ({
      getAll: () => Promise.resolve([
        {
          id: 'test-rule-1',
          url: 'https://api.example.com/users',
          active: true,
          response: '{"users": []}',
          status: '200',
          delay: '0',
          mock: 'true',
          payload: '',
          type: 'xhr',
          severity: 'info',
        },
        {
          id: 'test-rule-2',
          url: 'https://api.example.com/products',
          active: false,
          response: '{"products": []}',
          status: '200',
          delay: '0',
          mock: 'true',
          payload: '',
          type: 'xhr',
          severity: 'info',
        },
      ]),
    }),
    getRerouteRepo: () => ({
      getAll: mockGetAll,
    }),
  }
})

describe('debugger 模块测试', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockGetAll.mockResolvedValue([
      {
        id: 'reroute-1',
        url: 'https://api.example.com/old',
        rerouteUrl: 'https://api.example.com/new',
        enabled: true,
        urlType: 'PLAIN',
        actionType: 'REROUTE',
        comment: '测试重定向',
      },
      {
        id: 'reroute-2',
        url: '^https://api.example.com/users/(\\d+)$',
        rerouteUrl: 'https://api.example.com/profiles/$1',
        enabled: true,
        urlType: 'REGEX',
        actionType: 'REROUTE',
        comment: '测试正则重定向',
      },
    ])
  })

  describe('findMatchingRule', () => {
    it('应该正确匹配 URL', async () => {
      const url = 'https://api.example.com/users'
      const rule = await findMatchingRule(url)
      expect(rule).toBeDefined()
      expect(rule?.id).toBe('test-rule-1')
    })

    it('应该不匹配未激活的规则', async () => {
      const url = 'https://api.example.com/products'
      const rule = await findMatchingRule(url)
      expect(rule).toBeUndefined()
    })

    it('应该不匹配不存在的 URL', async () => {
      const url = 'https://api.example.com/not-exist'
      const rule = await findMatchingRule(url)
      expect(rule).toBeUndefined()
    })
  })

  describe('findMatchingRerouteRule', () => {
    it('应该正确匹配普通 URL', async () => {
      const url = 'https://api.example.com/old'
      const rule = await findMatchingRerouteRule(url)
      expect(rule).toBeDefined()
      expect(rule?.id).toBe('reroute-1')
    })

    it('应该正确匹配正则表达式 URL', async () => {
      const url = 'https://api.example.com/users/123'
      const rule = await findMatchingRerouteRule(url)
      expect(rule).toBeDefined()
      expect(rule?.id).toBe('reroute-2')
    })

    it('应该不匹配未启用的规则', async () => {
      mockGetAll.mockResolvedValueOnce([
        {
          id: 'reroute-1',
          url: 'https://api.example.com/old',
          rerouteUrl: 'https://api.example.com/new',
          enabled: false,
          urlType: 'PLAIN',
          actionType: 'REROUTE',
          comment: '测试重定向',
        },
      ])
      const url = 'https://api.example.com/old'
      const rule = await findMatchingRerouteRule(url)
      expect(rule).toBeUndefined()
    })
  })

  describe('handleMockResponse', () => {
    it('应该正确处理 mock 响应', async () => {
      const mockRule = {
        id: 'test-rule',
        url: 'https://api.example.com/test',
        active: true,
        response: '{"test": "data"}',
        status: '200',
        delay: '0',
        mock: 'true',
        payload: '',
        type: 'xhr',
        severity: 'info',
      }

      const result = await handleMockResponse(1, 'request-1', mockRule)
      expect(result).toBe(true)
    })

    it('应该正确处理延迟响应', async () => {
      const mockRule = {
        id: 'test-rule',
        url: 'https://api.example.com/test',
        active: true,
        response: '{"test": "data"}',
        status: '200',
        delay: '100',
        mock: 'true',
        payload: '',
        type: 'xhr',
        severity: 'info',
      }

      const startTime = Date.now()
      const result = await handleMockResponse(1, 'request-1', mockRule)
      const endTime = Date.now()

      expect(result).toBe(true)
      expect(endTime - startTime).toBeGreaterThanOrEqual(100)
    })

    it('应该处理调试器命令错误', async () => {
      const mockRule = {
        id: 'test-rule',
        url: 'https://api.example.com/test',
        active: true,
        response: '{"test": "data"}',
        status: '200',
        delay: '0',
        mock: 'true',
        payload: '',
        type: 'xhr',
        severity: 'info',
      }

      const mockDebugger = {
        sendCommand: vi.fn().mockRejectedValueOnce(new Error('Debugger error')),
      }

      // @ts-ignore
      fakeBrowser.debugger = mockDebugger

      const result = await handleMockResponse(1, 'request-1', mockRule)
      expect(result).toBe(false)
    })
  })

  describe('getDebuggerStatus', () => {
    it('应该正确获取调试器状态', async () => {
      const status = await getDebuggerStatus(1)
      expect(status).toEqual({
        tabId: 1,
        active: false,
      })
    })
  })
})
