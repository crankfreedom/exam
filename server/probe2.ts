import { Builder, By } from 'selenium-webdriver'

async function main() {
  const driver = await new Builder().forBrowser('chrome').build()
  try {
    // Go to catalog page
    await driver.get('https://www.fenbi.com/spa/tiku/guide/catalog/xingce?prefix=xingce')
    await driver.sleep(5000)

    // Check old selector
    const oldPage = await driver.findElements(By.css('#calalog-page'))
    console.log(`#calalog-page found: ${oldPage.length}`)

    // Dump body structure
    const bodyHtml = await driver.executeScript(`return document.body.innerHTML.slice(0, 5000)`)
    console.log(`\nbody html (first 5000):\n${bodyHtml}`)

    // Look for smart exam / 智能组卷 text
    const smartTexts = await driver.findElements(By.xpath("//*[contains(text(),'智能组卷')]"))
    console.log(`\n'智能组卷' elements: ${smartTexts.length}`)
    for (let i = 0; i < smartTexts.length; i++) {
      const tag = await smartTexts[i].getTagName()
      const txt = await smartTexts[i].getText()
      const cls = await smartTexts[i].getAttribute('class')
      const id = await smartTexts[i].getAttribute('id')
      console.log(`  [${i}] tag=${tag} id=${id} class="${cls}" text="${txt}"`)
    }

    // Look for clickable list items in catalog
    const listItems = await driver.findElements(By.css('li, [class*="catalog"], [class*="item"]'))
    console.log(`\nlist/catalog/item elements: ${listItems.length}`)
    for (let i = 0; i < Math.min(listItems.length, 30); i++) {
      const txt = (await listItems[i].getText()).trim().replace(/\n/g, ' ')
      const tag = await listItems[i].getTagName()
      const cls = await listItems[i].getAttribute('class')
      if (txt && txt.length < 50) console.log(`  [${i}] tag=${tag} class="${cls}" text="${txt}"`)
    }

    // Dump all buttons
    const buttons = await driver.findElements(By.css('button'))
    console.log(`\nbuttons: ${buttons.length}`)
    for (let i = 0; i < buttons.length; i++) {
      const txt = (await buttons[i].getText()).trim()
      const cls = await buttons[i].getAttribute('class')
      if (txt) console.log(`  button[${i}] text="${txt}" class="${cls}"`)
    }
  } finally {
    await driver.quit()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
