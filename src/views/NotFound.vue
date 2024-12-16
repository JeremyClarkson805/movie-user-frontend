<!-- ErrorPage.vue -->
<template>
  <div class="container">
    <div class="content">
      <div class="header">
        <div class="item">
          <div class="title">Your Client</div>
          <div ref="clientStatus" class="status"></div>
        </div>
        <div class="item">
          <div class="title">Network</div>
          <div ref="networkStatus" class="status"></div>
        </div>
        <div class="item">
          <div class="title">Web Server</div>
          <div ref="serverStatus" class="status"></div>
        </div>
      </div>

      <div class="error">
        <template v-if="code">
          <div class="error__title">{{ code }}</div>
        </template>
        <div v-if="message" class="error__message">{{ message }}</div>
      </div>

      <div class="help">
        <div class="help__title">What happened?</div>
        <div ref="description" class="help__description"></div>
        <div class="help__title">What can I do?</div>
        <div ref="solution" class="help__description">Please try again in a few minutes</div>
      </div>

      <div class="debug">
        <template v-for="(item, index) in debugItems" :key="index">
          <div class="debug__item">
            <div class="debug__item-name">{{ item.name }}</div>
            <div class="debug__item-value">{{ item.value }}</div>
          </div>
        </template>
      </div>

<!--      <div class="footer">-->
<!--        ShevonKwan ❤️ tarampampam/error-pages-->
<!--      </div>-->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const code = ref('')
const message = ref('')
const clientStatus = ref(null)
const networkStatus = ref(null)
const serverStatus = ref(null)
const description = ref(null)
const solution = ref(null)

const debugItems = ref([
  { name: 'Request ID', value: '' },
  { name: 'Request Time', value: '' },
  { name: 'Request', value: '' },
  { name: 'Request Host', value: '' },
  { name: 'Remote Address', value: '' },
  { name: 'Referer', value: '' },
  { name: 'Request Time (s)', value: '' },
  { name: 'Upstream Response Time (s)', value: '' },
  { name: 'User Agent', value: '' },
  { name: 'Server', value: '' }
])

const typeWriter = (element, text, speed = 50) => {
  return new Promise(resolve => {
    let i = 0
    element.textContent = ''

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i)
        i++
        setTimeout(type, speed)
      } else {
        resolve()
      }
    }

    type()
  })
}

const updateStatus = async () => {
  await typeWriter(clientStatus.value, 'Unknown')
  await new Promise(resolve => setTimeout(resolve, 300))
  await typeWriter(networkStatus.value, 'Working')
  await new Promise(resolve => setTimeout(resolve, 300))
  await typeWriter(serverStatus.value, 'Unknown')
  await new Promise(resolve => setTimeout(resolve, 300))
  await typeWriter(description.value, 'An error occurred while processing your request.')
}

const updateDebugInfo = () => {
  debugItems.value = [
    { name: 'Request ID', value: crypto.randomUUID() },
    { name: 'Request Time', value: new Date().toISOString() },
    { name: 'Request', value: 'GET /path/to/resource' },
    { name: 'Request Host', value: window.location.host },
    { name: 'Remote Address', value: '127.0.0.1' },
    { name: 'Referer', value: document.referrer },
    { name: 'Request Time (s)', value: '0.001' },
    { name: 'Upstream Response Time (s)', value: '0.001' },
    { name: 'User Agent', value: navigator.userAgent },
    { name: 'Server', value: 'nginx/1.19.0' }
  ]
}

onMounted(() => {
  updateStatus()
  updateDebugInfo()
  setInterval(updateDebugInfo, 5000)
})
</script>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
  padding: 0 20px;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #2f3948;
}

.content {
  width: 100%;
  max-width: 800px;
  margin: 40px auto;
}

.header {
  margin-bottom: 40px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.item:last-child {
  border-bottom: none;
}

.title {
  font-weight: 500;
}

.status {
  font-family: monospace;
  min-height: 1.2em;
}

.error {
  margin-bottom: 40px;
}

.error__title {
  margin-bottom: 5px;
  font-size: 24px;
  font-weight: 500;
}

.error__message {
  color: #606c7d;
}

.help {
  margin-bottom: 40px;
}

.help__title {
  margin-bottom: 5px;
  font-weight: 500;
}

.help__description {
  margin-bottom: 20px;
  color: #606c7d;
  font-family: monospace;
  min-height: 1.2em;
}

.debug {
  margin-bottom: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
}

.debug__item {
  display: flex;
  margin-bottom: 10px;
}

.debug__item:last-child {
  margin-bottom: 0;
}

.debug__item-name {
  width: 200px;
  padding-right: 20px;
  font-weight: 500;
}

.debug__item-value {
  flex: 1;
  word-break: break-all;
  font-family: monospace;
}

.footer {
  text-align: center;
  color: #909399;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }

  .content {
    margin: 20px auto;
  }

  .debug__item {
    flex-direction: column;
  }

  .debug__item-name {
    width: 100%;
    margin-bottom: 5px;
  }

  .debug__item-value {
    width: 100%;
  }
}
</style>