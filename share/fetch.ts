// @ts-nocheck
/**
 * 基于函数式编程和现代 async/await 语法的 Fetch 拦截器
 * 使用闭包和函数式编程范式重新实现
 * 改造自开源库: https://github.com/itsfadnis/fetch-interceptor
 *
 * 使用方法:
 *
 * 1. 导入拦截器
 * ```typescript
 * import FetchInterceptor from '@/share/fetch';
 * ```
 *
 * 2. 注册拦截钩子
 * ```typescript
 * const interceptor = FetchInterceptor.register({
 *   // 请求发送前调用，可以修改请求或返回模拟响应
 *   onBeforeRequest: (request, controller) => {
 *     // 添加通用请求头
 *     request.headers.set('Authorization', 'Bearer token');
 *
 *     // 可以返回模拟响应来跳过实际请求
 *     // return new Response(JSON.stringify({ data: 'mock' }), { status: 200 });
 *
 *     // 不返回任何内容则继续正常请求
 *   },
 *
 *   // 请求成功时调用 (status 2xx)
 *   onRequestSuccess: async (response, request, controller) => {
 *     // 可以检查响应并进行处理
 *     const data = await response.clone().json();
 *     console.log('请求成功:', data);
 *   },
 *
 *   // 请求失败时调用 (status 非2xx 或 网络错误)
 *   onRequestFailure: (error, request, controller) => {
 *     console.error('请求失败:', error);
 *   },
 *
 *   // 请求完成后调用(无论成功失败)
 *   onAfterRequest: (request, controller) => {
 *     console.log('请求完成');
 *   }
 * });
 * ```
 *
 * 3. 使用原生 fetch API 发送请求 (会自动被拦截)
 * ```typescript
 * const response = await fetch('/api/data');
 * const data = await response.json();
 * ```
 *
 * 4. 取消注册拦截器 (恢复原始fetch行为)
 * ```typescript
 * interceptor.unregister();
 * ```
 */

// 可用的钩子函数列表
const AVAILABLE_HOOKS = ['onBeforeRequest', 'onRequestSuccess', 'onRequestFailure', 'onAfterRequest']

// 单例实例
let interceptorInstance = null

/**
 * 创建标准化的 Request 对象
 * @param {Request|string} input - 请求对象或URL
 * @param {object} init - 请求配置选项
 * @param {AbortSignal} signal - 中止信号
 * @returns {Request} 标准化的请求对象
 */
function createStandardRequest(input: any, init: any = {}, signal: AbortSignal): Request {
  // 如果输入已经是 Request 对象
  if (input instanceof Request) {
    // 提取 Request 对象的所有属性
    const requestProps = [
      'cache',
      'context',
      'credentials',
      'destination',
      'headers',
      'integrity',
      'method',
      'mode',
      'redirect',
      'referrer',
      'referrerPolicy',
      'url',
      'body',
      'bodyUsed',
    ]

    // 创建新的配置对象
    const options = requestProps.reduce((acc, prop) => {
      if (prop in input) {
        acc[prop] = input[prop]
      }
      return acc
    }, {} as any)

    // 添加中止信号
    options.signal = signal

    // 从选项中提取 URL
    const { url, ...requestOptions } = options
    return new Request(url, requestOptions)
  }

  // 如果输入是 URL 字符串
  return new Request(input, { ...init, signal })
}

/**
 * 创建拦截器实例
 * @returns {object} 拦截器内部状态和方法
 */
function createInterceptor() {
  // 内部状态
  const state = {
    env: window,
    originalFetch: window.fetch,
    hooks: {},
  }

  /**
   * 处理请求响应
   * @param {Response} response - 响应对象
   * @param {Request} request - 请求对象
   * @param {AbortController} controller - 中止控制器
   * @param {boolean} isMockResponse - 是否为模拟响应
   * @returns {Promise<Response>} 处理后的响应
   */
  const handleResponse = async (response, request, controller, isMockResponse = false) => {
    // 只有非模拟响应才会触发成功或失败钩子
    if (!isMockResponse) {
      // 根据响应状态调用成功或失败钩子
      if (response.ok) {
        if (typeof state.hooks.onRequestSuccess === 'function') {
          await state.hooks.onRequestSuccess(response, request, controller)
        }
      }
      else {
        if (typeof state.hooks.onRequestFailure === 'function') {
          await state.hooks.onRequestFailure(response, request, controller)
        }
      }
    }

    return response
  }

  /**
   * 劫持全局 fetch 并插入注册的钩子函数
   */
  const hijack = () => {
    // 创建中止控制器
    const controller = new AbortController()
    const signal = controller.signal

    // 替换全局 fetch 函数
    state.env.fetch = async (...args) => {
      try {
        // 创建标准化的请求对象
        const request = createStandardRequest(args[0], args[1], signal)

        // 调用请求前钩子
        let mockResponse = null
        if (typeof state.hooks.onBeforeRequest === 'function') {
          mockResponse = await state.hooks.onBeforeRequest(request, controller)
        }

        // 发送请求或使用模拟响应
        let response
        let isMockResponse = false

        if (mockResponse) {
          // 使用模拟响应
          response = mockResponse
          isMockResponse = true
        }
        else {
          // 发送真实请求
          response = await state.originalFetch.call(state.env, request)
        }

        // 调用请求后钩子
        if (typeof state.hooks.onAfterRequest === 'function') {
          await state.hooks.onAfterRequest(request, controller)
        }

        // 处理响应，传入是否为模拟响应的标志
        return await handleResponse(response, request, controller, isMockResponse)
      }
      catch (error) {
        // 处理请求错误
        if (typeof state.hooks.onRequestFailure === 'function') {
          await state.hooks.onRequestFailure(
            error,
            args[0] instanceof Request ? args[0] : new Request(args[0], args[1]),
            controller,
          )
        }

        // 重新抛出错误，保持与原生 fetch 一致的行为
        throw error
      }
    }
  }

  /**
   * 重置 fetch 并注销拦截钩子
   */
  const unregister = () => {
    state.env.fetch = state.originalFetch
    interceptorInstance = null
  }

  return {
    state,
    hijack,
    unregister,
  }
}

/**
 * 创建 Fetch 拦截器
 */
const FetchInterceptor = {
  /**
   * 注册拦截钩子并返回拦截器实例（单例模式）
   * @param {object} hooks - 拦截钩子函数对象
   * @return {object} 拦截器公共接口
   */
  register: (hooks = {}) => {
    // 如果已存在实例，直接返回
    if (interceptorInstance) {
      return interceptorInstance
    }

    // 创建新实例
    const interceptor = createInterceptor()

    // 注册钩子函数
    AVAILABLE_HOOKS.forEach((hookName) => {
      if (typeof hooks[hookName] === 'function') {
        interceptor.state.hooks[hookName] = hooks[hookName]
      }
    })

    // 启动拦截
    interceptor.hijack()

    // 创建公共接口
    const publicApi = {
      unregister: interceptor.unregister,
    }

    // 保存实例
    interceptorInstance = publicApi

    return publicApi
  },
}

export default FetchInterceptor
