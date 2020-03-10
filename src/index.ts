import '@libotony/sharp-cli/script'
import { params, executor, authority } from './contract'

const thor = global.connex.thor

const listApprovers = async () => {
    const addrs = new Set<string>()
    const best = thor.status.head.number
    const step = 10
    let curr = 0
    for (; ;){
        const evs = await executor
            .approverEvent
            .filter([])
            .range({
                unit: 'block',
                from: 0,
                to: best
            })
            .apply(curr, step)
        if (evs.length) {
            for (const e of evs) {
                if (e.decoded!.action === executor.actions.added) {
                    addrs.add(e.decoded!.approver)
                } else if (e.decoded!.action === executor.actions.revoked) {
                    addrs.delete(e.decoded!.approver)
                } else {
                    throw new Error('invalid action in event approver')
                }
            }
            curr += step
        } else {
            break
        }
    }
    const ret = await executor.approverCount.call()
    if(parseInt(ret.decoded!['0'] as string, 10) !== addrs.size){
        throw new Error('approvers count mismatch!')
    }
    const approvers: {
        address: string,
        identity: string
    }[] = []
    for (const addr of addrs) {
        const ret = await executor.approvers.call(addr)
        if (!ret.decoded!.inPower) {
            throw new Error('filtered approver not in power')
        }
        approvers.push({
            address: addr,
            identity: Buffer.from(ret.decoded!.identity.slice(2) as string, 'hex').toString().replace(/\0/g,'')
        })
    }
    return approvers
}

const listAuthorities = async () => {
    const ZeroAddress = '0x'.padEnd(42, '0')

    const nodes: {
        master: string;
        endorsor: string;
        identity: string;
        active:boolean
    }[] = []

    let ret = await authority.first.call()
    let current = ret.decoded!['0']
    for (; current !== ZeroAddress;) {
        ret = await authority.get.call(current)
        nodes.push({
            master: current,
            endorsor: ret.decoded!.endorsor,
            identity: ret.decoded!.identity,
            active:ret.decoded!.active
        })
        ret = await authority.next.call(current)
        current = ret.decoded!['0']
    }

    return nodes
}

// Params
// Approvers
// Authorities
const main = async () => {
    let ret = await params.get.call(params.keys.executor)
    const executor = '0x'+ BigInt(ret.decoded!['0']).toString(16).padStart(40,'0')
    console.log('[Param] executor: ' + executor)
    ret = await params.get.call(params.keys.rewardRatio)
    const rewardRatio = BigInt(ret.decoded!['0'])*BigInt(100)/BigInt(1e18)
    console.log(`[Param] reward-ratio: ${rewardRatio.toString(10)}%`)
    ret = await params.get.call(params.keys.baseGasPrice)
    const baseGasPrice = BigInt(ret.decoded!['0'])
    console.log(`[Param] base-gas-price: ${baseGasPrice.toString(10)} WEI/GAS`)
    ret = await params.get.call(params.keys.proposerEndorsement)
    const proposerEndorsement = BigInt(ret.decoded!['0'])
    console.log(`[Param] proposer-endorsement: ${proposerEndorsement.toString(10)} WEI${proposerEndorsement / BigInt(1e18) > 0 ? ' [' + (proposerEndorsement / BigInt(1e18)).toString(10) + ' VET]' : ''}`)
    const approvers = await listApprovers()
    console.log('[Executor(aka steering committee)] approvers count:' + approvers.length)
    console.table(approvers)
    const authorities = await listAuthorities()
    console.log('[Authority] count:' + authorities.length)
    console.table(authorities)
    return
}

export default main
