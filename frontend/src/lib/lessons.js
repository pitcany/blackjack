import { Rank, Suit, Card, Action } from './engine';

export const MODULES = [
    {
        id: 'foundations',
        title: 'Module A: Foundations',
        description: 'Master the basics of Blackjack rules, hand values, and house edge.',
        lessons: [
            { id: 'a1', title: 'Hand Values', description: 'Learn to calculate hard and soft totals.' },
            { id: 'a2', title: 'The Dealer', description: 'Understanding dealer rules and when they bust.' }
        ]
    },
    {
        id: 'basic_strategy',
        title: 'Module B: Basic Strategy',
        description: 'Perfect your decision making without counting.',
        lessons: [
            { id: 'b1', title: 'Hard Totals', description: 'When to Hit, Stand, or Double on hard hands.' },
            { id: 'b2', title: 'Soft Totals', description: 'Strategy for hands with a flexible Ace.' },
            { id: 'b3', title: 'Pair Splitting', description: 'When to split and when to play the total.' }
        ]
    },
    {
        id: 'counting_hilo',
        title: 'Module C: Hi-Lo Counting',
        description: 'The most popular card counting system.',
        lessons: [
            { id: 'c1', title: 'Running Count', description: 'Track the flow of high and low cards.' },
            { id: 'c2', title: 'True Count', description: 'Adjusting for decks remaining.' }
        ]
    },
    {
        id: 'deviations',
        title: 'Module D: Index Plays',
        description: 'Advanced plays based on the count.',
        lessons: [
            { id: 'd1', title: 'The Fab 4', description: 'The four most important deviations.' },
            { id: 'd2', title: 'Illustrious 18', description: 'Complete index play reference.' }
        ]
    },
    {
        id: 'betting',
        title: 'Module E: Bet Sizing',
        description: 'How to size your bets based on advantage.',
        lessons: [
            { id: 'e1', title: 'Bet Spreads', description: 'Scaling bets with the True Count.' }
        ]
    }
];

// Helper to track lesson completion requirements
export const LESSON_PREREQUISITES = {
    'a1': [],           // No prerequisites
    'a2': ['a1'],       // Must complete A1
    'b1': ['a1', 'a2'], // Must complete A1 and A2
    'b2': ['b1'],       // Must complete B1
    'b3': ['b2'],       // Must complete B2
    'c1': ['b1'],       // Must understand basic strategy first
    'c2': ['c1'],       // Must understand running count
    'd1': ['c2'],       // Must understand true count
    'd2': ['d1'],       // Must understand basic deviations
    'e1': ['c2']        // Must understand true count
};

// Minimum lessons required to access Table
export const TABLE_ACCESS_REQUIREMENTS = ['a1', 'a2', 'b1'];

export const LESSONS = {
    'a1': {
        id: 'a1',
        title: 'Hand Values',
        steps: [
            {
                type: 'info',
                text: 'In Blackjack, number cards are worth their face value. Face cards (J, Q, K) are worth 10. Aces are worth 1 or 11.',
                scenario: {
                    playerHands: [[new Card(Rank.KING, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TWO, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: 'What is the value of your hand (King + 5)?',
                options: ['5', '10', '15', '25'],
                answer: '15',
                text: 'King = 10, plus 5 = 15. This is a "hard" 15.',
                scenario: {
                    playerHands: [[new Card(Rank.KING, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TWO, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'info',
                text: 'A "Soft" hand contains an Ace counted as 11. Example: A-6 = Soft 17. It cannot bust with one hit because the Ace can become 1.',
                scenario: {
                    playerHands: [[new Card(Rank.ACE, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: 'What type of hand is Ace + 6?',
                options: ['Hard 7', 'Soft 17', 'Hard 17', 'Soft 7'],
                answer: 'Soft 17',
                text: 'Ace (11) + 6 = Soft 17. The Ace can flex to 1 if needed.'
            },
            {
                type: 'action',
                text: 'You have Soft 17. Hit to improve - you cannot bust!',
                instruction: 'Hit',
                scenario: {
                    playerHands: [[new Card(Rank.ACE, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    nextCards: [new Card(Rank.THREE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            }
        ]
    },

    'a2': {
        id: 'a2',
        title: 'The Dealer',
        steps: [
            {
                type: 'info',
                text: 'The dealer must follow strict rules: Hit on 16 or less, Stand on 17 or more. The dealer has NO choice - these rules are mandatory.',
                scenario: null
            },
            {
                type: 'quiz',
                question: 'If the dealer has 16, what must they do?',
                options: ['Stand', 'Hit', 'Their choice', 'Double'],
                answer: 'Hit',
                text: 'Dealers MUST hit on 16 or less. No exceptions.'
            },
            {
                type: 'info',
                text: 'The dealer busts about 28% of the time. They bust most often showing a 5 or 6 (about 42% bust rate). This is why we stand on stiff hands vs 5-6.',
                scenario: {
                    playerHands: [[new Card(Rank.TEN, Suit.HEARTS), new Card(Rank.TWO, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.SIX, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: 'Which dealer upcard gives them the highest bust rate?',
                options: ['2', '6', '10', 'Ace'],
                answer: '6',
                text: 'Dealer showing 6 busts ~42% of the time. Showing 2 busts ~35%.'
            },
            {
                type: 'info',
                text: 'Dealer upcards 2-6 are "weak" (high bust rate). 7-A are "strong" (low bust rate). Your strategy changes based on this!',
                scenario: null
            },
            {
                type: 'quiz',
                question: 'Is a dealer showing 7 considered weak or strong?',
                options: ['Weak (will likely bust)', 'Strong (will likely make a hand)'],
                answer: 'Strong (will likely make a hand)',
                text: 'Dealer 7 only busts ~26%. They will usually make 17+.'
            }
        ]
    },

    'b1': {
        id: 'b1',
        title: 'Hard Totals',
        steps: [
            {
                type: 'info',
                text: 'Hard hands have no flexible Ace. The key rule: STAND on 12-16 vs dealer 2-6 (wait for dealer to bust). HIT on 12-16 vs dealer 7-A (you need to improve).',
                scenario: null
            },
            {
                type: 'quiz',
                question: 'You have hard 14, dealer shows 6. What should you do?',
                options: ['Hit', 'Stand', 'Double'],
                answer: 'Stand',
                text: 'Stand! Dealer 6 busts often. Let them take the risk.'
            },
            {
                type: 'action',
                text: 'You have hard 15 vs dealer 10. Dealer 10 is STRONG - you must hit to have a chance.',
                instruction: 'Hit',
                scenario: {
                    playerHands: [[new Card(Rank.TEN, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.SEVEN, Suit.DIAMONDS)],
                    nextCards: [new Card(Rank.FOUR, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'info',
                text: 'DOUBLE on 10 or 11 vs weak dealer cards. You get one card and double your bet - great when you are likely to win!',
                scenario: {
                    playerHands: [[new Card(Rank.SIX, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.SIX, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'action',
                text: 'You have 11 vs dealer 6. DOUBLE! This is one of the best situations in blackjack.',
                instruction: 'Double',
                scenario: {
                    playerHands: [[new Card(Rank.SIX, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.SIX, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    nextCards: [new Card(Rank.TEN, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: 'You have hard 10. When should you double?',
                options: ['Always', 'Never', 'Vs dealer 2-9', 'Vs dealer 2-6'],
                answer: 'Vs dealer 2-9',
                text: 'Double 10 vs 2-9. Only hit vs 10 or Ace.'
            },
            {
                type: 'info',
                text: 'Hard 12 is special: HIT vs 2-3 (they might not bust), STAND vs 4-6. Always hit hard 12 vs 7+.',
                scenario: {
                    playerHands: [[new Card(Rank.SEVEN, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.THREE, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'action',
                text: 'You have hard 12 vs dealer 3. HIT! Dealer 3 is not weak enough to stand.',
                instruction: 'Hit',
                scenario: {
                    playerHands: [[new Card(Rank.SEVEN, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.THREE, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    nextCards: [new Card(Rank.SIX, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: 'Summary: Hard 13-16 vs dealer 6. What do you do?',
                options: ['Hit', 'Stand', 'Double'],
                answer: 'Stand',
                text: 'Stand on stiff hands (12-16) vs weak dealers (2-6). Let them bust!'
            }
        ]
    },

    'b2': {
        id: 'b2',
        title: 'Soft Totals',
        steps: [
            {
                type: 'info',
                text: 'Soft hands are flexible because the Ace can count as 1 or 11. Key principle: Be aggressive! You cannot bust with one hit.',
                scenario: {
                    playerHands: [[new Card(Rank.ACE, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.SIX, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: 'You have A-5 (Soft 16). Can you bust by hitting?',
                options: ['Yes', 'No'],
                answer: 'No',
                text: 'Never! If you hit and get a 10, your A-5-10 = 16 (Ace becomes 1).'
            },
            {
                type: 'info',
                text: 'DOUBLE soft hands vs weak dealer upcards (4-6). Soft 13-17 double vs 5-6. Soft 15-17 also double vs 4.',
                scenario: {
                    playerHands: [[new Card(Rank.ACE, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.FIVE, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'action',
                text: 'Soft 17 (A-6) vs dealer 5. DOUBLE! Great opportunity.',
                instruction: 'Double',
                scenario: {
                    playerHands: [[new Card(Rank.ACE, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.FIVE, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    nextCards: [new Card(Rank.THREE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'info',
                text: 'Soft 18 (A-7) is tricky: STAND vs 2, 7, 8. DOUBLE vs 3-6. HIT vs 9, 10, A.',
                scenario: {
                    playerHands: [[new Card(Rank.ACE, Suit.HEARTS), new Card(Rank.SEVEN, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.NINE, Suit.CLUBS), new Card(Rank.FIVE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'action',
                text: 'Soft 18 vs dealer 9. HIT! 18 is not strong enough against 9.',
                instruction: 'Hit',
                scenario: {
                    playerHands: [[new Card(Rank.ACE, Suit.HEARTS), new Card(Rank.SEVEN, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.NINE, Suit.CLUBS), new Card(Rank.FIVE, Suit.DIAMONDS)],
                    nextCards: [new Card(Rank.TWO, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: 'Soft 19 (A-8) vs any dealer card. What do you do?',
                options: ['Hit', 'Stand', 'Double'],
                answer: 'Stand',
                text: 'Soft 19 and 20 - always stand. These are strong hands!'
            }
        ]
    },

    'b3': {
        id: 'b3',
        title: 'Pair Splitting',
        steps: [
            {
                type: 'info',
                text: 'When dealt a pair, you can split into two hands. This costs an extra bet but can turn a bad hand into two good ones!',
                scenario: {
                    playerHands: [[new Card(Rank.EIGHT, Suit.HEARTS), new Card(Rank.EIGHT, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.SIX, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'info',
                text: 'ALWAYS split Aces and 8s. A-A: Two chances at 21. 8-8: 16 is terrible, but 8 is a decent starting point.',
                scenario: {
                    playerHands: [[new Card(Rank.EIGHT, Suit.HEARTS), new Card(Rank.EIGHT, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.SEVEN, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'action',
                text: '8-8 vs dealer 10. SPLIT! 16 is the worst hand. Two 8s give you a fighting chance.',
                instruction: 'Split',
                scenario: {
                    playerHands: [[new Card(Rank.EIGHT, Suit.HEARTS), new Card(Rank.EIGHT, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.SEVEN, Suit.DIAMONDS)],
                    nextCards: [new Card(Rank.THREE, Suit.DIAMONDS), new Card(Rank.TWO, Suit.HEARTS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'info',
                text: 'NEVER split 10s or 5s. 10-10 = 20 (great hand!). 5-5 = 10 (double it instead!).',
                scenario: {
                    playerHands: [[new Card(Rank.FIVE, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.SIX, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'action',
                text: '5-5 vs dealer 6. DOUBLE, not split! You have 10 vs a weak dealer.',
                instruction: 'Double',
                scenario: {
                    playerHands: [[new Card(Rank.FIVE, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.SIX, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    nextCards: [new Card(Rank.KING, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: '9-9 vs dealer 7. Split or Stand?',
                options: ['Split', 'Stand'],
                answer: 'Stand',
                text: 'Stand! 18 beats dealer 17 (they likely have 17 with a 7 up).'
            },
            {
                type: 'info',
                text: 'Split 2s, 3s, 6s, 7s vs dealer 2-7. Split 4s only vs 5-6. Split 9s vs 2-6, 8-9 (stand vs 7, 10, A).',
                scenario: null
            },
            {
                type: 'quiz',
                question: 'Quick memory check: Always split which two pairs?',
                options: ['Aces and 8s', 'Aces and 10s', '8s and 9s', '2s and 3s'],
                answer: 'Aces and 8s',
                text: 'Always split Aces (two shots at 21) and 8s (16 is terrible).'
            }
        ]
    },

    'c1': {
        id: 'c1',
        title: 'Running Count',
        steps: [
            {
                type: 'info',
                text: 'Hi-Lo assigns values: 2-6 = +1 (low cards help dealer), 7-9 = 0 (neutral), 10-A = -1 (high cards help player).',
                scenario: null
            },
            {
                type: 'quiz',
                question: 'What is the Hi-Lo value of a 5?',
                options: ['+1', '0', '-1'],
                answer: '+1',
                text: 'Low cards (2-6) are +1. When they leave the deck, the remaining deck favors the player.'
            },
            {
                type: 'quiz',
                question: 'What is the Hi-Lo value of a King?',
                options: ['+1', '0', '-1'],
                answer: '-1',
                text: 'High cards (10, J, Q, K, A) are -1. When they leave, the deck favors the dealer.'
            },
            {
                type: 'info',
                text: 'The Running Count starts at 0. Add/subtract as cards are dealt. Positive = deck rich in high cards (good for player).',
                scenario: {
                    playerHands: [[new Card(Rank.KING, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TWO, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    runningCount: 0,
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: 'Cards dealt: King, 5, 2. What is the Running Count?',
                text: 'King (-1) + 5 (+1) + 2 (+1) = +1',
                options: ['-1', '0', '+1', '+2'],
                answer: '+1',
                scenario: {
                    playerHands: [[new Card(Rank.KING, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TWO, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    runningCount: 1,
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: 'Cards: 10, 3, 7, Ace, 4. Running Count?',
                text: '10 (-1) + 3 (+1) + 7 (0) + Ace (-1) + 4 (+1) = 0',
                options: ['-2', '-1', '0', '+1'],
                answer: '0'
            }
        ]
    },

    'c2': {
        id: 'c2',
        title: 'True Count',
        steps: [
            {
                type: 'info',
                text: 'The Running Count alone is not enough. A +4 count means more in a 1-deck game than a 6-deck game. We need the TRUE COUNT.',
                scenario: null
            },
            {
                type: 'info',
                text: 'True Count = Running Count ÷ Decks Remaining. Example: RC +6 with 2 decks left = TC +3.',
                scenario: null
            },
            {
                type: 'quiz',
                question: 'Running Count is +8, 4 decks remaining. True Count?',
                options: ['+1', '+2', '+4', '+8'],
                answer: '+2',
                text: 'TC = +8 ÷ 4 = +2'
            },
            {
                type: 'quiz',
                question: 'Running Count is +6, 2 decks remaining. True Count?',
                options: ['+2', '+3', '+4', '+6'],
                answer: '+3',
                text: 'TC = +6 ÷ 2 = +3'
            },
            {
                type: 'info',
                text: 'Each +1 True Count gives you roughly +0.5% edge. At TC +2, you have about a 0.5% advantage over the house!',
                scenario: null
            },
            {
                type: 'quiz',
                question: 'At True Count +4, approximately what is your edge?',
                options: ['0%', '+1%', '+1.5%', '+2%'],
                answer: '+1.5%',
                text: 'TC +4 × 0.5% = +2%, minus ~0.5% house edge = +1.5% player edge.'
            },
            {
                type: 'info',
                text: 'Practice estimating decks remaining. Full 6-deck shoe ≈ 6 decks. Half-way through ≈ 3 decks. Learn to eyeball the discard tray.',
                scenario: null
            }
        ]
    },

    'd1': {
        id: 'd1',
        title: 'The Fab 4',
        steps: [
            {
                type: 'info',
                text: 'Index plays (deviations) change Basic Strategy based on the True Count. The "Fab 4" are the four most valuable deviations.',
                scenario: null
            },
            {
                type: 'info',
                text: '#1: 16 vs 10. Basic Strategy says HIT. But if TC ≥ 0, STAND. High count means more 10s to bust you.',
                scenario: {
                    playerHands: [[new Card(Rank.TEN, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.TWO, Suit.DIAMONDS)],
                    runningCount: 0,
                    phase: 'player_turn'
                }
            },
            {
                type: 'action',
                text: '16 vs 10, True Count = 0. This is the break-even point. STAND.',
                instruction: 'Stand',
                scenario: {
                    playerHands: [[new Card(Rank.TEN, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.TWO, Suit.DIAMONDS)],
                    runningCount: 0,
                    phase: 'player_turn'
                }
            },
            {
                type: 'info',
                text: '#2: 15 vs 10. Basic Strategy says HIT. At TC ≥ +4, STAND instead.',
                scenario: {
                    playerHands: [[new Card(Rank.TEN, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.TWO, Suit.DIAMONDS)],
                    runningCount: 24,
                    phase: 'player_turn'
                }
            },
            {
                type: 'action',
                text: '15 vs 10, True Count = +4. STAND! The deck is rich in 10s.',
                instruction: 'Stand',
                scenario: {
                    playerHands: [[new Card(Rank.TEN, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.TWO, Suit.DIAMONDS)],
                    runningCount: 24,
                    phase: 'player_turn'
                }
            },
            {
                type: 'info',
                text: '#3: 10 vs 10. Basic Strategy says HIT. At TC ≥ +4, DOUBLE instead!',
                scenario: null
            },
            {
                type: 'info',
                text: '#4: 12 vs 3. Basic Strategy says HIT. At TC ≥ +2, STAND. Dealer 3 busts more with high count.',
                scenario: {
                    playerHands: [[new Card(Rank.SEVEN, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.THREE, Suit.CLUBS), new Card(Rank.TWO, Suit.DIAMONDS)],
                    runningCount: 12,
                    phase: 'player_turn'
                }
            },
            {
                type: 'action',
                text: '12 vs 3, True Count = +2. STAND! Deviation from basic strategy.',
                instruction: 'Stand',
                scenario: {
                    playerHands: [[new Card(Rank.SEVEN, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.THREE, Suit.CLUBS), new Card(Rank.TWO, Suit.DIAMONDS)],
                    runningCount: 12,
                    phase: 'player_turn'
                }
            }
        ]
    },

    'd2': {
        id: 'd2',
        title: 'Illustrious 18',
        steps: [
            {
                type: 'info',
                text: 'The "Illustrious 18" are the most valuable index plays. We already covered #1-4 (Fab 4). Here are more key deviations:',
                scenario: null
            },
            {
                type: 'info',
                text: '#5: Insurance at TC ≥ +3. Normally never take insurance. But at TC +3+, there are enough 10s to make it profitable.',
                scenario: null
            },
            {
                type: 'info',
                text: '#6: 12 vs 2. Basic says HIT. At TC ≥ +3, STAND.',
                scenario: null
            },
            {
                type: 'info',
                text: '#7: 11 vs Ace. Basic says HIT. At TC ≥ +1, DOUBLE.',
                scenario: null
            },
            {
                type: 'info',
                text: '#8: 9 vs 2. Basic says HIT. At TC ≥ +1, DOUBLE.',
                scenario: null
            },
            {
                type: 'info',
                text: '#9: 10 vs Ace. Basic says HIT. At TC ≥ +4, DOUBLE.',
                scenario: null
            },
            {
                type: 'info',
                text: '#10: 9 vs 7. Basic says HIT. At TC ≥ +3, DOUBLE.',
                scenario: null
            },
            {
                type: 'quiz',
                question: 'You have 11 vs Ace, TC = +2. What should you do?',
                options: ['Hit (basic strategy)', 'Double (deviation)'],
                answer: 'Double (deviation)',
                text: '11 vs A: Double at TC ≥ +1. At TC +2, definitely double!'
            },
            {
                type: 'info',
                text: 'Memorize these gradually. Start with Fab 4, add 2-3 more each session. The Illustrious 18 capture 80%+ of index play value.',
                scenario: null
            }
        ]
    },

    'e1': {
        id: 'e1',
        title: 'Bet Spreads',
        steps: [
            {
                type: 'info',
                text: 'Card counting only works if you BET MORE when you have the advantage. Flat betting will not overcome the house edge.',
                scenario: null
            },
            {
                type: 'info',
                text: 'A common spread: Bet 1 unit at TC ≤ +1, 2 units at TC +2, 4 units at TC +3, 8 units at TC +4+.',
                scenario: null
            },
            {
                type: 'quiz',
                question: 'True Count is +3. Your min bet is $25. What should you bet?',
                options: ['$25 (1 unit)', '$50 (2 units)', '$100 (4 units)', '$200 (8 units)'],
                answer: '$100 (4 units)',
                text: 'At TC +3, bet 4 units = $100.'
            },
            {
                type: 'info',
                text: 'At negative counts, bet the minimum. Some players "Wong out" (leave the table) at TC ≤ -1 to avoid playing at a disadvantage.',
                scenario: null
            },
            {
                type: 'quiz',
                question: 'True Count is -2. What should you bet?',
                options: ['Minimum bet', 'Leave the table', 'Either is acceptable'],
                answer: 'Either is acceptable',
                text: 'Bet minimum or leave. Never bet big at negative counts!'
            },
            {
                type: 'info',
                text: 'Your bankroll should be 200-400x your big bet to survive variance. If max bet is $200, bankroll should be $40,000-$80,000.',
                scenario: null
            },
            {
                type: 'info',
                text: 'The HUD in this trainer shows recommended bet sizes based on True Count. Practice matching your bets to the count!',
                scenario: null
            }
        ]
    }
};

// Legacy alias for backward compatibility
LESSONS['e1_old'] = LESSONS['d1'];
