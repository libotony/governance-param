import '@libotony/sharp-cli/script'
const thor = global.connex.thor

export const ParamsAddress = '0x' + Buffer.from('Params').toString('hex').padStart(40, '0')
export const AuthorityAddress = '0x' + Buffer.from('Authority').toString('hex').padStart(40, '0')
export const ExecutorAddress = '0x' + Buffer.from('Executor').toString('hex').padStart(40, '0')

const paramsGetABI = { constant: true, inputs: [{ name: '_key', type: 'bytes32' }], name: 'get', outputs: [{ name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function' }
const approversABI = { 'constant': true, 'inputs': [{ 'name': '', 'type': 'address' }], 'name': 'approvers', 'outputs': [{ 'name': 'identity', 'type': 'bytes32' }, { 'name': 'inPower', 'type': 'bool' }], 'payable': false, 'stateMutability': 'view', 'type': 'function' }
const approverCountABI = { 'constant': true, 'inputs': [], 'name': 'approverCount', 'outputs': [{ 'name': '', 'type': 'uint8' }], 'payable': false, 'stateMutability': 'view', 'type': 'function' }
const approverEventABI = {'anonymous':false,'inputs':[{'indexed':true,'name':'approver','type':'address'},{'indexed':false,'name':'action','type':'bytes32'}],'name':'Approver','type':'event'}
const firstABI = {constant: true, inputs: [], name: 'first', outputs: [{name: '', type: 'address'}], payable: false, stateMutability: 'view', type: 'function'}
const getABI = { constant: true, inputs: [{ name: '_nodeMaster', type: 'address' }], name: 'get', outputs: [{ name: 'listed', type: 'bool' }, { name: 'endorsor', type: 'address' }, { name: 'identity', type: 'bytes32' }, { name: 'active', type: 'bool' }], payable: false, stateMutability: 'view', type: 'function' }
const nextABI = {constant: true, inputs: [{name: '_nodeMaster', type: 'address'}], name: 'next', outputs: [{name: '', type: 'address'}], payable: false, stateMutability: 'view', type: 'function'}

export const authority = {
    first: thor.account(AuthorityAddress).method(firstABI),
    get: thor.account(AuthorityAddress).method(getABI),
    next: thor.account(AuthorityAddress).method(nextABI)
}
export const executor = {
    approvers: thor.account(ExecutorAddress).method(approversABI),
    approverCount: thor.account(ExecutorAddress).method(approverCountABI),
    approverEvent: thor.account(ExecutorAddress).event(approverEventABI),
    actions: {
        added: '0x' + Buffer.from('added').toString('hex').padEnd(64, '0'),
        revoked: '0x' + Buffer.from('revoked').toString('hex').padEnd(64, '0'),
    }
}
export const params = {
    get: thor.account(ParamsAddress).method(paramsGetABI),
    keys: {
        executor: '0x' + Buffer.from('executor').toString('hex').padStart(64, '0'),
        rewardRatio: '0x' + Buffer.from('reward-ratio').toString('hex').padStart(64, '0'),
        baseGasPrice: '0x' + Buffer.from('base-gas-price').toString('hex').padStart(64, '0'),
        proposerEndorsement: '0x' + Buffer.from('proposer-endorsement').toString('hex').padStart(64, '0')
    }
}
