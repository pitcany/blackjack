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
            { id: 'b2', title: 'Soft Totals', description: 'Playing hands with a flexible Ace.' }
        ]
    },
    {
        id: 'counting_hilo',
        title: 'Module C: Hi-Lo Counting',
        description: 'The most popular card counting system.',
        lessons: [
            { id: 'c1', title: 'Running Count', description: 'Track the flow of high and low cards.' },
            { id: 'c2', title: 'True Count', description: 'Adjusting for decks remaining — the key to accuracy.' },
            { id: 'c3', title: 'Why Counting Works', description: 'Understand the math behind the edge.' }
        ]
    },
    {
        id: 'betting',
        title: 'Module D: Bet Sizing',
        description: 'Convert count advantage into profit.',
        lessons: [
            { id: 'd1', title: 'Bet Spreads', description: 'When and how much to increase your bet.' },
            { id: 'd2', title: 'Bankroll & Variance', description: 'Surviving the swings of advantage play.' }
        ]
    },
    {
        id: 'deviations',
        title: 'Module E: Deviations',
        description: 'Advanced plays based on the count.',
        lessons: [
            { id: 'e1', title: 'The Illustrious 18', description: 'The most valuable count-based strategy changes.' },
            { id: 'e2', title: 'The Fab Four', description: 'Critical surrender decisions based on count.' }
        ]
    },
    {
        id: 'real_world',
        title: 'Module F: Real-World Play',
        description: 'What works in casinos vs. simulators.',
        lessons: [
            { id: 'f1', title: 'Where Counting Works', description: 'CSMs, online, and other traps to avoid.' }
        ]
    }
];

export const LESSONS = {
    // ============================================
    // MODULE A: FOUNDATIONS
    // ============================================
    'a1': {
        id: 'a1',
        title: 'Hand Values',
        steps: [
            {
                type: 'info',
                text: 'In Blackjack, number cards (2-10) are worth their face value. Face cards (J, Q, K) are all worth 10. Aces can be 1 or 11.',
                scenario: {
                    playerHands: [[new Card(Rank.KING, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TWO, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: 'What is the value of your hand? (King + 5)',
                options: ['5', '10', '15', '25'],
                answer: '15',
                explanation: 'King = 10, plus 5 = 15. Face cards are always worth 10.',
                scenario: {
                    playerHands: [[new Card(Rank.KING, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TWO, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'info',
                text: 'A "Soft" hand contains an Ace counted as 11. You cannot bust with one hit because the Ace can become 1.',
                scenario: {
                    playerHands: [[new Card(Rank.ACE, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: 'You have Ace + 6. What is this hand called?',
                options: ['Hard 7', 'Soft 17', 'Hard 17', 'Blackjack'],
                answer: 'Soft 17',
                explanation: 'Ace (11) + 6 = 17. It\'s "soft" because the Ace can become 1 if you hit and get a high card.'
            },
            {
                type: 'action',
                text: 'This is a Soft 17. You should always Hit (or Double). You cannot bust because the Ace will become 1 if needed.',
                instruction: 'Hit',
                scenario: {
                    playerHands: [[new Card(Rank.ACE, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    nextCards: [new Card(Rank.TEN, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'info',
                text: 'After hitting, your Ace became 1: A(1) + 6 + 10 = 17. This is now a "Hard 17" — no flexible Ace.'
            }
        ]
    },

    'a2': {
        id: 'a2',
        title: 'The Dealer',
        steps: [
            {
                type: 'info',
                text: 'The dealer follows strict rules: Hit on 16 or less, Stand on 17 or more. The dealer has no choice — these rules are automatic.'
            },
            {
                type: 'info',
                text: 'Most casinos use "H17" (Hit Soft 17): the dealer hits on Soft 17 (A+6). This slightly increases the house edge.'
            },
            {
                type: 'quiz',
                question: 'Dealer shows 6. What is the probability they bust?',
                options: ['About 23%', 'About 42%', 'About 58%', 'About 75%'],
                answer: 'About 42%',
                explanation: 'A dealer showing 6 busts ~42% of the time. This is why 5 and 6 are the "bust cards" — you stand more often against them.'
            },
            {
                type: 'info',
                text: 'Dealer bust rates by upcard: 2(35%), 3(37%), 4(40%), 5(42%), 6(42%), 7(26%), 8(24%), 9(23%), 10(23%), A(17%). Low cards = dealer busts more.'
            },
            {
                type: 'quiz',
                question: 'Why do low cards (2-6) favor standing on stiff hands?',
                options: [
                    'Dealer is likely to bust',
                    'Your hand will improve',
                    'The count goes up',
                    'You get paid more'
                ],
                answer: 'Dealer is likely to bust',
                explanation: 'When dealer shows 2-6, they have 35-42% chance to bust. Your job is to not bust first and let them take the risk.'
            }
        ]
    },

    // ============================================
    // MODULE B: BASIC STRATEGY
    // ============================================
    'b1': {
        id: 'b1',
        title: 'Hard Totals',
        steps: [
            {
                type: 'info',
                text: 'Basic Strategy is the mathematically optimal play for every hand vs. every dealer upcard. It reduces the house edge to about 0.5%.'
            },
            {
                type: 'info',
                text: 'Hard totals 12-16 are "stiff hands" — you can bust if you hit. The key question: is the risk of busting worth avoiding the dealer\'s likely hand?'
            },
            {
                type: 'action',
                text: 'You have 16 vs dealer 7. Basic strategy says HIT. Why? Dealer makes 17+ about 74% of the time with a 7 showing. You must improve.',
                instruction: 'Hit',
                scenario: {
                    playerHands: [[new Card(Rank.TEN, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.SEVEN, Suit.CLUBS), new Card(Rank.TWO, Suit.DIAMONDS)],
                    nextCards: [new Card(Rank.FOUR, Suit.CLUBS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'action',
                text: 'You have 16 vs dealer 5. Basic strategy says STAND. The dealer will bust ~42% of the time. Let them take the risk.',
                instruction: 'Stand',
                scenario: {
                    playerHands: [[new Card(Rank.TEN, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.FIVE, Suit.CLUBS), new Card(Rank.TWO, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: 'You have 12 vs dealer 3. What should you do?',
                options: ['Hit', 'Stand', 'Double', 'Surrender'],
                answer: 'Hit',
                explanation: '12 vs 3 is a HIT in basic strategy. You only stand on 12 vs 4-6. Against 2-3, the dealer doesn\'t bust often enough.'
            },
            {
                type: 'info',
                text: 'Key hard total rules: Always stand 17+. Stand 13-16 vs 2-6. Hit 12 vs 2-3, stand vs 4-6. Always hit 11 or less (or double).'
            }
        ]
    },

    'b2': {
        id: 'b2',
        title: 'Soft Totals',
        steps: [
            {
                type: 'info',
                text: 'Soft hands (with a flexible Ace) are valuable because you can\'t bust with one hit. This means you can be more aggressive.'
            },
            {
                type: 'action',
                text: 'Soft 17 (A+6) vs dealer 5. You should DOUBLE. You have a chance to improve and the dealer will bust often.',
                instruction: 'Double',
                scenario: {
                    playerHands: [[new Card(Rank.ACE, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.FIVE, Suit.CLUBS), new Card(Rank.TWO, Suit.DIAMONDS)],
                    nextCards: [new Card(Rank.FOUR, Suit.CLUBS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: 'You have Soft 18 (A+7) vs dealer 9. What should you do?',
                options: ['Stand', 'Hit', 'Double', 'Surrender'],
                answer: 'Hit',
                explanation: 'Soft 18 feels strong, but 18 loses to dealer\'s likely 19 when they show 9. Hit to try to improve — you can\'t bust.'
            },
            {
                type: 'info',
                text: 'Soft 18 is the trickiest hand. Stand vs 2,7,8. Double vs 3-6. Hit vs 9,10,A. Many players wrongly stand on all soft 18s.'
            }
        ]
    },

    // ============================================
    // MODULE C: HI-LO COUNTING
    // ============================================
    'c1': {
        id: 'c1',
        title: 'Running Count',
        steps: [
            {
                type: 'info',
                text: 'Hi-Lo is the most popular counting system. It tracks the ratio of high cards to low cards remaining in the shoe.'
            },
            {
                type: 'info',
                text: 'Card values: 2-6 = +1 (low cards, favor dealer). 7-9 = 0 (neutral). 10,J,Q,K,A = -1 (high cards, favor player).'
            },
            {
                type: 'quiz',
                question: 'What is the Hi-Lo value of a King?',
                options: ['+1', '0', '-1', '+2'],
                answer: '-1',
                explanation: 'All 10-value cards (10, J, Q, K) and Aces are -1. When they leave the deck, the count goes down.'
            },
            {
                type: 'quiz',
                question: 'Cards dealt: King, 5, 2. What is the Running Count?',
                options: ['-1', '0', '+1', '+2'],
                answer: '+1',
                explanation: 'King (-1) + 5 (+1) + 2 (+1) = +1. More low cards dealt means more high cards remain.',
                scenario: {
                    playerHands: [[new Card(Rank.KING, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TWO, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    runningCount: 0,
                    phase: 'player_turn'
                }
            },
            {
                type: 'info',
                text: 'Practice counting in pairs that cancel: K+5 = 0, 10+3 = 0, A+4 = 0. This speeds up your counting at the table.'
            }
        ]
    },

    'c2': {
        id: 'c2',
        title: 'True Count',
        steps: [
            {
                type: 'info',
                text: 'The Running Count alone is misleading. RC +6 with 6 decks left is very different from RC +6 with 1 deck left.'
            },
            {
                type: 'info',
                text: 'True Count = Running Count ÷ Decks Remaining. This normalizes the count to tell you the actual density of high cards.'
            },
            {
                type: 'quiz',
                question: 'RC is +8, 4 decks remain. What is the True Count?',
                options: ['+1', '+2', '+4', '+8'],
                answer: '+2',
                explanation: 'TC = 8 ÷ 4 = +2. This is a moderately favorable count worth increasing your bet.'
            },
            {
                type: 'quiz',
                question: 'RC is +6, 2 decks remain. True Count?',
                options: ['+2', '+3', '+6', '+12'],
                answer: '+3',
                explanation: 'TC = 6 ÷ 2 = +3. Very favorable! Each TC point is worth roughly 0.5% player edge.'
            },
            {
                type: 'info',
                text: 'Quick estimation: Eyeball the discard tray. If it\'s 2 trays high in a 6-deck game, ~2 decks dealt, ~4 remain.'
            },
            {
                type: 'quiz',
                question: 'At True Count +3, approximately what is the player edge?',
                options: ['0.5%', '1.0%', '1.5%', '3.0%'],
                answer: '1.5%',
                explanation: 'Each TC point ≈ 0.5% edge. TC +3 ≈ 1.5% player advantage. This is when you bet big.'
            }
        ]
    },

    'c3': {
        id: 'c3',
        title: 'Why Counting Works',
        steps: [
            {
                type: 'info',
                text: 'Card counting works because high cards favor the player and low cards favor the dealer. Here\'s why:'
            },
            {
                type: 'info',
                text: 'HIGH CARDS (10,J,Q,K,A) favor the player: (1) Blackjacks pay 3:2 — more likely with 10s+Aces. (2) Doubling 10,11 is more profitable. (3) Dealer must hit stiffs and busts more.'
            },
            {
                type: 'info',
                text: 'LOW CARDS (2-6) favor the dealer: (1) Dealer improves stiff hands instead of busting. (2) Player blackjacks less frequent. (3) Doubling is less effective.'
            },
            {
                type: 'quiz',
                question: 'Why does a positive count favor the player?',
                options: [
                    'More low cards remain',
                    'More high cards remain',
                    'The dealer shuffles sooner',
                    'Bets pay more'
                ],
                answer: 'More high cards remain',
                explanation: 'A positive count means more low cards have been dealt, leaving the deck rich in high cards. High cards = player advantage.'
            },
            {
                type: 'info',
                text: 'The edge is small (~0.5-1.5%) but real. Over thousands of hands, this mathematical edge compounds into profit — if you have the bankroll to survive variance.'
            }
        ]
    },

    // ============================================
    // MODULE D: BET SIZING
    // ============================================
    'd1': {
        id: 'd1',
        title: 'Bet Spreads',
        steps: [
            {
                type: 'info',
                text: 'Counting cards is useless unless you bet more when you have the advantage. This is called "bet spreading."'
            },
            {
                type: 'info',
                text: 'Simple spread: Bet 1 unit at TC ≤ +1. Bet 2 units at TC +2. Bet 4 units at TC +3. Bet 6-8 units at TC +4 or higher.'
            },
            {
                type: 'quiz',
                question: 'True Count is +4. Your base unit is $25. What should you bet?',
                options: ['$25', '$50', '$100', '$150-200'],
                answer: '$150-200',
                explanation: 'At TC +4, bet 6-8 units. With $25 base, that\'s $150-200. This is where your profit comes from.'
            },
            {
                type: 'info',
                text: 'Warning: Large bet spreads attract casino attention. A 1-8 spread is aggressive. Many recreational counters use 1-4 or 1-6.'
            },
            {
                type: 'quiz',
                question: 'True Count is -2. What should you do?',
                options: ['Bet maximum', 'Bet minimum', 'Bet 2 units', 'Leave the table'],
                answer: 'Bet minimum',
                explanation: 'At negative counts, the house has an extra edge. Bet minimum or consider leaving if the count stays negative.'
            }
        ]
    },

    'd2': {
        id: 'd2',
        title: 'Bankroll & Variance',
        steps: [
            {
                type: 'info',
                text: 'CRITICAL: Card counting has a SMALL edge (~1%). You WILL have losing sessions, losing weeks, even losing months. This is normal.'
            },
            {
                type: 'info',
                text: 'Standard deviation is ~1.15 bets per hand. A 500-hand session can easily end -30 units with perfect play. This is variance, not bad counting.'
            },
            {
                type: 'quiz',
                question: 'What is the minimum recommended bankroll for serious play?',
                options: ['50× max bet', '100× max bet', '200-400× max bet', '1000× max bet'],
                answer: '200-400× max bet',
                explanation: 'To survive normal variance with ~1% risk of ruin, you need 200-400× your max bet. Underfunded counters go broke during normal swings.'
            },
            {
                type: 'info',
                text: 'Reality check: With $25 max bet and 1% edge, you earn ~$2.50/hour long-term. Card counting is about small, consistent edges — not getting rich quick.'
            },
            {
                type: 'info',
                text: 'NEVER bet money you can\'t afford to lose. Even with an edge, short-term results are essentially random. The edge only appears over thousands of hands.'
            }
        ]
    },

    // ============================================
    // MODULE E: DEVIATIONS
    // ============================================
    'e1': {
        id: 'e1',
        title: 'The Illustrious 18',
        steps: [
            {
                type: 'info',
                text: 'Deviations are changes to Basic Strategy based on the True Count. The "Illustrious 18" are the 18 most valuable deviations.'
            },
            {
                type: 'info',
                text: 'The top 6 deviations account for ~80% of the value. Master these first: Insurance (+3), 16v10 (0), 15v10 (+4), 10v10 (+4), 12v3 (+2), 12v2 (+3).'
            },
            {
                type: 'action',
                text: '16 vs 10: Basic strategy says HIT. But at TC ≥ 0, the deck is rich in 10s — you\'ll bust often. STAND at TC 0 or higher.',
                instruction: 'Stand',
                scenario: {
                    playerHands: [[new Card(Rank.TEN, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.TWO, Suit.DIAMONDS)],
                    runningCount: 6, // TC ~+1 with 6 decks
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: '16 vs 10, True Count is -2. What should you do?',
                options: ['Stand', 'Hit', 'Double', 'Surrender'],
                answer: 'Hit',
                explanation: 'At negative counts, more high cards have been dealt. It\'s safer to hit because you\'re less likely to draw a 10.'
            },
            {
                type: 'info',
                text: 'Insurance is the most valuable deviation. Basic strategy says never take it (7% house edge). But at TC ≥ +3, insurance becomes profitable.'
            },
            {
                type: 'quiz',
                question: 'Dealer shows Ace, TC is +4. Should you take insurance?',
                options: ['Yes', 'No'],
                answer: 'Yes',
                explanation: 'At TC +3 or higher, enough 10s remain that insurance (paying 2:1 for dealer BJ) becomes +EV. This is the #1 deviation by value.'
            }
        ]
    },

    'e2': {
        id: 'e2',
        title: 'The Fab Four',
        steps: [
            {
                type: 'info',
                text: 'The "Fab Four" are four surrender deviations. Surrender gives back half your bet to avoid likely losses. These are high-value plays.'
            },
            {
                type: 'info',
                text: 'Fab Four: (1) 14 vs 10 at TC +3. (2) 15 vs 10 at TC 0. (3) 15 vs 9 at TC +2. (4) 15 vs A at TC +1.'
            },
            {
                type: 'quiz',
                question: 'You have 15 vs dealer 10. TC is +1. What should you do?',
                options: ['Hit', 'Stand', 'Surrender', 'Double'],
                answer: 'Surrender',
                explanation: 'At TC 0 or higher, 15 vs 10 should surrender. You\'ll lose more than half your bet on average if you play it out.'
            },
            {
                type: 'info',
                text: 'Surrender saves money in bad situations. Basic strategy uses it rarely, but with counting, the Fab Four add significant value.'
            },
            {
                type: 'quiz',
                question: 'Why does a high count make surrender better for 15 vs 10?',
                options: [
                    'Dealer more likely to have 20',
                    'You\'re more likely to bust',
                    'Both of the above',
                    'Neither'
                ],
                answer: 'Both of the above',
                explanation: 'High count = more 10s. Dealer likely has 20. If you hit, you\'ll likely bust. Surrender saves half your bet vs. losing it all.'
            }
        ]
    },

    // ============================================
    // MODULE F: REAL-WORLD PLAY
    // ============================================
    'f1': {
        id: 'f1',
        title: 'Where Counting Works',
        steps: [
            {
                type: 'info',
                text: 'Card counting ONLY works when cards are removed from play between shuffles. Many modern games defeat counting entirely.'
            },
            {
                type: 'info',
                text: 'CONTINUOUS SHUFFLING MACHINES (CSMs): Cards return to the shoe immediately. The count never develops. Counting is USELESS on CSMs.'
            },
            {
                type: 'quiz',
                question: 'Can you count cards at an online casino?',
                options: ['Yes, same as live', 'Only with multiple decks', 'No, it doesn\'t work', 'Only on live dealer games'],
                answer: 'No, it doesn\'t work',
                explanation: 'Online casinos shuffle every hand or use RNG. There\'s no persistent shoe to count. Don\'t waste your time or money.'
            },
            {
                type: 'info',
                text: '6:5 BLACKJACK: Avoid at all costs. 6:5 payout adds ~1.4% to house edge. Even perfect counting can\'t overcome this.'
            },
            {
                type: 'info',
                text: 'PENETRATION: How deep the dealer goes before shuffling. 75%+ is good. Below 60% makes counting nearly worthless.'
            },
            {
                type: 'quiz',
                question: 'Before sitting down, what should you verify?',
                options: [
                    'Traditional shoe (no CSM)',
                    '3:2 blackjack payout',
                    '70%+ penetration',
                    'All of the above'
                ],
                answer: 'All of the above',
                explanation: 'Counting only works with: traditional shoe, 3:2 BJ, good penetration. Missing ANY of these makes counting unprofitable.'
            },
            {
                type: 'info',
                text: 'Card counting is LEGAL but casinos can ask you to leave. Keep your spreads reasonable (1:4 or 1:6) and don\'t stare at the discard tray.'
            }
        ]
    }
};
