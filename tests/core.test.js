import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeCandidate, parseCandidate, windowsToWsl } from '../src/core.js'
import { csvRows } from '../src/host.js'

test('converts Windows paths to WSL paths',()=>assert.equal(windowsToWsl('D:\\Files\\a.pdf'),'/mnt/d/Files/a.pdf'))
test('honors custom WSL drive mounts',()=>assert.equal(windowsToWsl('X:\\Files\\a.pdf',{X:'/mnt/q'}),'/mnt/q/Files/a.pdf'))
test('resolves workspace relative paths',()=>assert.equal(normalizeCandidate('docs/a.md','/work','/home/u'),'/work/docs/a.md'))
test('parses quoted Everything CSV',()=>assert.deepEqual(csvRows('\ufeffFilename,Size\r\n"D:\\a,b.txt",12\r\n'),[['Filename','Size'],['D:\\a,b.txt','12']]))
test('parses line ranges without confusing a Windows drive',()=>assert.deepEqual(parseCandidate('D:\\work\\app.ts:10-30'),{path:'D:\\work\\app.ts',lineStart:10,lineEnd:30}))
test('parses PDF pages and media time fragments',()=>{assert.deepEqual(parseCandidate('/docs/a.pdf#page=3'),{path:'/docs/a.pdf',page:3});assert.deepEqual(parseCandidate('/media/a.mp4#t=12.5'),{path:'/media/a.mp4',time:12.5})})
