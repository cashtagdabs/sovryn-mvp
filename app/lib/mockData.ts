export type FeedPost = {
    id: string;
    author: {
        name: string;
        handle: string;
        avatar: string;
        reputation: number;
    };
    model: string;
    prompt: string;
    output: string;
    tags: string[];
    likes: number;
    comments: number;
    remixes: number;
    timestamp: string;
};

export type ModelAsset = {
    id: string;
    name: string;
    author: string;
    description: string;
    tags: string[];
    rating: number;
    downloads: number;
    license: 'COMMERCIAL' | 'NON_COMMERCIAL';
    price: number;
    currency: 'PRIME' | 'USD';
    version: string;
    updatedAt: string;
    samples: string[];
};

export type LedgerEntry = {
    id: string;
    type: 'tip' | 'boost' | 'purchase' | 'stake' | 'reward';
    amount: number;
    counterparty: string;
    note: string;
    timestamp: string;
};

export type GovernanceProposal = {
    id: string;
    title: string;
    summary: string;
    status: 'ACTIVE' | 'QUEUED' | 'PASSED' | 'DEFEATED';
    endsAt: string;
    forVotes: number;
    againstVotes: number;
    abstainVotes: number;
};

export const MOCK_FEED: FeedPost[] = [
    {
        id: 'p1',
        author: {
            name: 'Rhea Navarro',
            handle: '@rhea',
            avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
            reputation: 98,
        },
        model: 'claude-3-sonnet-20240229',
        prompt: 'Draft a manifesto for a decentralized AI guild with practical steps.',
        output:
            'We build with intent: open training data registries, portable weights, and cooperative model councils that rotate every epoch. Every member stakes reputation, and contributions are scored transparently on-chain.',
        tags: ['governance', 'strategy', 'ai-guild'],
        likes: 241,
        comments: 32,
        remixes: 14,
        timestamp: '5m ago',
    },
    {
        id: 'p2',
        author: {
            name: 'Orion Labs',
            handle: '@orion',
            avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
            reputation: 87,
        },
        model: 'gpt-4-turbo-preview',
        prompt: 'Generate a weekly market brief for AI infra tokens.',
        output:
            'Layer-2 inference saw 18% TVL growth; Solana-based zk-provers gained liquidity; PRIME velocity increased with staking inflows. Watch gas compression wars on rollups next week.',
        tags: ['markets', 'prime', 'brief'],
        likes: 189,
        comments: 21,
        remixes: 9,
        timestamp: '22m ago',
    },
    {
        id: 'p3',
        author: {
            name: 'Nova Collective',
            handle: '@nova',
            avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
            reputation: 92,
        },
        model: 'mixtral-8x7b-32768',
        prompt: 'Produce a punchy onboarding script for PRIMEX Social.',
        output:
            'Claim your handle, mint your model passport, and drop your first AI-native post. Stake PRIME to boost the best crews; fork models like repos; every remix shares royalties.',
        tags: ['onboarding', 'script', 'social'],
        likes: 156,
        comments: 18,
        remixes: 11,
        timestamp: '1h ago',
    },
];

export const MOCK_MODELS: ModelAsset[] = [
    {
        id: 'm1',
        name: 'PRIMEX Ultra v0.6',
        author: 'Nova Collective',
        description: 'Multimodal generalist tuned for social generation, summaries, and remixable hooks.',
        tags: ['multimodal', 'social', 'remixable'],
        rating: 4.9,
        downloads: 4821,
        license: 'COMMERCIAL',
        price: 120,
        currency: 'PRIME',
        version: '0.6.1',
        updatedAt: 'Today',
        samples: ['Writes catchy hooks', 'Summarizes debates', 'Suggests remix prompts'],
    },
    {
        id: 'm2',
        name: 'Sovereign Guard',
        author: 'Orion Labs',
        description: 'Safety-first classifier with bias probes, watermarking, and audit trails.',
        tags: ['safety', 'audit', 'watermark'],
        rating: 4.7,
        downloads: 2310,
        license: 'COMMERCIAL',
        price: 45,
        currency: 'USD',
        version: '1.2.0',
        updatedAt: '2d ago',
        samples: ['Classifies harmful content', 'Adds invisible watermark', 'Flags bias pockets'],
    },
    {
        id: 'm3',
        name: 'Edge Whisper',
        author: 'Helix Field',
        description: 'Lightweight speech-to-text tuned for edge devices with offline fallback.',
        tags: ['audio', 'edge', 'offline'],
        rating: 4.6,
        downloads: 3199,
        license: 'NON_COMMERCIAL',
        price: 0,
        currency: 'PRIME',
        version: '0.9.3',
        updatedAt: '5d ago',
        samples: ['Mobile STT', 'Noise-robust transcription', 'Edge-friendly quantization'],
    },
];

export const MOCK_LEDGER: LedgerEntry[] = [
    {
        id: 'l1',
        type: 'tip',
        amount: 12,
        counterparty: '@rhea',
        note: 'Tip for governance playbook',
        timestamp: '6m ago',
    },
    {
        id: 'l2',
        type: 'purchase',
        amount: 120,
        counterparty: 'PRIMEX Ultra v0.6',
        note: 'Model purchase',
        timestamp: '1h ago',
    },
    {
        id: 'l3',
        type: 'stake',
        amount: 250,
        counterparty: 'Sovereign Guard pool',
        note: 'Staked for yield',
        timestamp: '1d ago',
    },
    {
        id: 'l4',
        type: 'reward',
        amount: 34,
        counterparty: 'DAO epoch rewards',
        note: 'Participation bonus',
        timestamp: '3d ago',
    },
];

export const MOCK_PROPOSALS: GovernanceProposal[] = [
    {
        id: 'g1',
        title: 'Adopt watermarking by default for public posts',
        summary: 'Enable opt-out watermarking for public AI posts with transparent flags for remixes.',
        status: 'ACTIVE',
        endsAt: '12h left',
        forVotes: 612_000,
        againstVotes: 88_000,
        abstainVotes: 12_000,
    },
    {
        id: 'g2',
        title: 'Add PRIME fee rebate for model forks',
        summary: 'Return 25% of fork fees to original creators to encourage open model graph growth.',
        status: 'QUEUED',
        endsAt: 'Queued',
        forVotes: 0,
        againstVotes: 0,
        abstainVotes: 0,
    },
    {
        id: 'g3',
        title: 'Launch PRIMEX Academy track',
        summary: 'Fund curated learning paths for promptcraft, evals, and safety with bounties.',
        status: 'PASSED',
        endsAt: 'Passed',
        forVotes: 401_200,
        againstVotes: 22_900,
        abstainVotes: 4_100,
    },
];
