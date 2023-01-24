import {afterAll, beforeAll, beforeEach, describe, test} from 'vitest';
import {startApp, initialize, focusEditor, assertHTML, html} from '../../utils/e2e';

describe('Code Block card', async () => {
    let app;
    let page;

    beforeAll(async () => {
        ({app, page} = await startApp());
    });

    afterAll(async () => {
        await app.stop();
    });

    beforeEach(async () => {
        await initialize({page});
    });

    test('can import serialized code block card nodes', async function () {
        await page.evaluate(() => {
            const serializedState = JSON.stringify({
                root: {
                    children: [{
                        type: 'codeblock',
                        code: '<script></script>',
                        language: 'javascript',
                        caption: 'A code block'
                    }],
                    direction: null,
                    format: '',
                    indent: 0,
                    type: 'root',
                    version: 1
                }
            });
            const editor = window.lexicalEditor;
            const editorState = editor.parseEditorState(serializedState);
            editor.setEditorState(editorState);
        });

        await assertHTML(page, html`
            <div data-lexical-decorator="true" contenteditable="false">
                <div data-kg-card-selected="false" data-kg-card-editing="false" data-kg-card="codeblock">
                </div>
            </div>
        `, {ignoreCardContents: true});
    });

    test('renders code block card node', async function () {
        await focusEditor(page);
        await page.keyboard.type('```javascript ');

        await assertHTML(page, html`
            <div data-lexical-decorator="true" contenteditable="false">
                <div data-kg-card-selected="true" data-kg-card-editing="true" data-kg-card="codeblock">
                </div>
            </div>
        `, {ignoreCardContents: true});
    });

    test('it hides the language input when typing in the code editor and shows it when the mouse moves', async function () {
        await focusEditor(page);
        await page.keyboard.type('```javascript ');

        // Type in the editor
        await page.keyboard.type('Here are some words');

        // The language input should be hidden
        expect(await page.$('[data-testid="code-card-language"].opacity-0')).not.toBeNull();
        expect(await page.$('[data-testid="code-card-language"].opacity-100')).toBeNull();

        // Move the mouse
        await page.mouse.move(0,0);

        // The language input should be visible
        expect(await page.$('[data-testid="code-card-language"].opacity-0')).toBeNull();
        expect(await page.$('[data-testid="code-card-language"].opacity-100')).not.toBeNull();
    });
});
