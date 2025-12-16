import { Rank, Suit, Card, Action } from './engine';

export const MODULES = [
    {
        id: 'foundations',
        title: 'Module A: Foundations',
        description: 'Master the basics of Blackjack rules, hand values, and house edge.',
        lessons: [
            { id: 'a1', title: 'Hand Values', description: 'Learn to calculate hard and soft totals.' },
            { id: 'a2', title: 'The Dealer', description: 'Understanding dealer rules and upcards.' }
        ]
    },
    {
        id: 'basic_strategy',
        title: 'Module B: Basic Strategy',
        description: 'Perfect your decision making without counting.',
        lessons: [
            { id: 'b1', title: 'Hard Totals', description: 'When to Hit or Stand on hard hands.' }
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
        title: 'Module E: Deviations',
        description: 'Advanced plays based on the count.',
        lessons: [
            { id: 'e1', title: 'The Fab 4', description: 'Critical deviations including 16 vs 10.' }
        ]
    }
];

export const LESSONS = {
    'a1': {
        id: 'a1',
        title: 'Hand Values',
        steps: [
            {
                type: 'info',
                text: 'In Blackjack, number cards are worth their face value. Face cards (J, Q, K) are worth 10. Aces are 1 or 11.',
                scenario: {
                    playerHands: [[new Card(Rank.KING, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]], // 15
                    dealerHand: [new Card(Rank.TWO, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'quiz',
                question: 'What is the value of your hand?',
                options: ['5', '10', '15', '25'],
                answer: '15',
                text: 'You have a King (10) and a 5.',
                 scenario: {
                    playerHands: [[new Card(Rank.KING, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TWO, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'info',
                text: 'A "Soft" hand contains an Ace counted as 11. It cannot bust with one hit.',
                scenario: {
                    playerHands: [[new Card(Rank.ACE, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]], // Soft 17
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    phase: 'player_turn'
                }
            },
            {
                type: 'action',
                text: 'This is a Soft 17. Always Hit (or Double) because you cannot bust.',
                instruction: 'Hit',
                scenario: {
                    playerHands: [[new Card(Rank.ACE, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)],
                    nextCards: [new Card(Rank.TEN, Suit.DIAMONDS)], // Will make it 17 Hard (1+6+10)
                    phase: 'player_turn'
                }
            }
        ]
    },
    'c1': {
        id: 'c1',
        title: 'Running Count',
        steps: [
            {
                type: 'info',
                text: 'Hi-Lo assigns values to cards: 2-6 are +1, 7-9 are 0, 10-A are -1.',
                scenario: null
            },
            {
                type: 'quiz',
                question: 'What is the Hi-Lo value of a King?',
                options: ['+1', '0', '-1'],
                answer: '-1',
                text: 'Face cards and Tens are -1.'
            },
            {
                type: 'quiz',
                question: 'What is the Running Count here? (King, 5, 2)',
                text: 'King (-1) + 5 (+1) + 2 (+1) = +1.',
                options: ['-1', '0', '+1', '+2'],
                answer: '+1',
                scenario: {
                    playerHands: [[new Card(Rank.KING, Suit.HEARTS), new Card(Rank.FIVE, Suit.SPADES)]],
                    dealerHand: [new Card(Rank.TWO, Suit.CLUBS), new Card(Rank.NINE, Suit.DIAMONDS)], // Dealer Up 2
                    runningCount: 0, // Reset
                    phase: 'player_turn'
                }
            }
        ]
    },
    'e1': {
        id: 'e1',
        title: 'The Fab 4',
        steps: [
            {
                type: 'info',
                text: 'Deviations are changes to Basic Strategy based on the True Count. The most famous is 16 vs 10.',
                scenario: {
                    playerHands: [[new Card(Rank.TEN, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]], // 16
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.TWO, Suit.DIAMONDS)], // 10 up
                    phase: 'player_turn',
                    runningCount: 0 
                }
            },
            {
                type: 'action',
                text: 'Basic Strategy says HIT 16 vs 10. Try it now (Count is 0).',
                instruction: 'Hit',
                scenario: {
                    playerHands: [[new Card(Rank.TEN, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]], 
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.TWO, Suit.DIAMONDS)],
                    runningCount: 0,
                    phase: 'player_turn',
                    nextCards: [new Card(Rank.FIVE, Suit.CLUBS)] // 21
                }
            },
            {
                type: 'info',
                text: 'But if the Count is HIGH (True Count >= 0), there are many 10s left. Hitting is likely to bust. So we STAND.',
                scenario: {
                    playerHands: [[new Card(Rank.TEN, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]], 
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.TWO, Suit.DIAMONDS)],
                    runningCount: 12, // TC approx 2 if 6 decks
                    phase: 'player_turn'
                }
            },
            {
                type: 'action',
                text: 'True Count is +2. Stand on 16 vs 10.',
                instruction: 'Stand',
                scenario: {
                    playerHands: [[new Card(Rank.TEN, Suit.HEARTS), new Card(Rank.SIX, Suit.SPADES)]], 
                    dealerHand: [new Card(Rank.TEN, Suit.CLUBS), new Card(Rank.TWO, Suit.DIAMONDS)],
                    runningCount: 12,
                    phase: 'player_turn'
                }
            }
        ]
    }
};
