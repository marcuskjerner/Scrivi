const mocha = require('mocha')
const chai = require('chai')
const path = require('path')
const { Application } = require('spectron')
const robot = require('robotjs')

const assert = chai.assert
const expect = chai.expect

const baseDir = path.join(__dirname, '..')
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron')

/**
 * Tests for the Main Electron Process
 */
describe('Main Application', function() {
  this.timeout(21000)
  const app = new Application({
    path: electronBinary,
    args: [baseDir]
  })
  before(() => app.start())
  after(() => app.stop())

  it('Shows initial Window', async () => {
    await app.client.waitUntilWindowLoaded()
    const count = await app.client.getWindowCount()

    expect(count).to.be.above(1)
  })

  it('Sets the window title correctly', async () => {
    await app.client.waitUntilWindowLoaded()
    const title = await app.client.getTitle()

    assert.equal(title, 'Scrivi - Markdown Editor')
  })

  it('Does not have the developer tools open', async () => {
    const devToolsAreOpen = await app.client
      .waitUntilWindowLoaded()
      .browserWindow.isDevToolsOpened()
    return assert.equal(devToolsAreOpen, false)
  })

  it('ipcRender sends a message when CTRL+S is pressed', async () => {
    await app.client.waitUntilWindowLoaded()

    const payloadReceived = false

    await robot.keyToggle('control', 'down')
    await robot.keyTap('s')
    await robot.keyToggle('control', 'up')

    assert.isTrue(!payloadReceived)
  })
})

/**
 * Tests for the Editor Component and it's children.
 */
describe('Editor', function() {
  this.timeout(21000)
  const app = new Application({
    path: electronBinary,
    args: [baseDir]
  })

  before(() => app.start())
  after(() => app.stop())

  it('<Editor /> loads correctly', async () => {
    await app.client.waitUntilWindowLoaded()
    const cmp = await app.client.$$('.editor')

    return assert.isDefined(cmp, 'The <Editor /> component exists')
  })

  it('<MDInput /> loads correctly', async () => {
    await app.client.waitUntilWindowLoaded()
    const cmp = await app.client.$$('#markdown-output')

    return assert.isDefined(cmp, 'The <MDRender /> component exists')
  })

  it('<MDRender /> loads correctly', async () => {
    await app.client.waitUntilWindowLoaded()
    const cmp = await app.client.$$('.markdownInput')

    return assert.isDefined(cmp, 'The <MDInput /> component exists')
  })

  it('Sidebar has a title with the text "Workspaces"', async () => {
    await app.client.waitUntilWindowLoaded()
    const sidebarLabel = await app.client.getText('#sidebar_title')
    return assert.equal(sidebarLabel, 'WORKSPACES')
  })

  it('Sidebar has menu items', async () => {
    await app.client.waitUntilWindowLoaded()
    const menuItems = await app.client.$$('.menu_files')
    return expect(menuItems.length).to.be.above(0)
  })
})
