import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeCandidate, windowsToWsl } from '../src/core.js'
import { csvRows } from '../src/host.js'

test('converts Windows paths to WSL paths',()=>assert.equal(windowsToWsl('D:\\Files\\a.pdf'),'/mnt/d/Files/a.pdf'))
test('honors custom WSL drive mounts',()=>assert.equal(windowsToWsl('X:\\Files\\a.pdf',{X:'/mnt/q'}),'/mnt/q/Files/a.pdf'))
test('resolves workspace relative paths',()=>assert.equal(normalizeCandidate('docs/a.md','/work','/home/u'),'/work/docs/a.md'))
test('parses quoted Everything CSV',()=>assert.deepEqual(csvRows('\ufeffFilename,Size\r\n"D:\\a,b.txt",12\r\n'),[['Filename','Size'],['D:\\a,b.txt','12']]))
