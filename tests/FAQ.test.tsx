import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import FAQ from '../components/FAQ';
import {
  FAQ_CATEGORIES,
  FaqCategory,
  publishedFaqCategories,
} from '../lib/faq';

afterEach(() => cleanup());

const allItems = FAQ_CATEGORIES.flatMap((category) => category.items);

describe('FAQ content', () => {
  it('publishes only questions that have a confirmed answer', () => {
    const fixture: FaqCategory[] = [
      {
        title: 'Answered',
        items: [
          { question: 'Q1', answer: 'A1' },
          { question: 'Q2', answer: null },
        ],
      },
      { title: 'All pending', items: [{ question: 'Q3', answer: null }] },
    ];

    expect(publishedFaqCategories(fixture)).toEqual([
      { title: 'Answered', items: [{ question: 'Q1', answer: 'A1' }] },
    ]);
  });

  it('has no duplicate or blank questions', () => {
    const questions = allItems.map((item) => item.question.trim());
    expect(questions.every(Boolean)).toBe(true);
    expect(new Set(questions).size).toBe(questions.length);
  });

  it('keeps the four answers the site already published', () => {
    const answered = allItems
      .filter((item) => item.answer)
      .map((i) => i.question);
    expect(answered).toEqual(
      expect.arrayContaining([
        'What is the venue capacity?',
        'Can we bring our own vendors?',
        'Is there parking on-site?',
        'Do you require event insurance?',
      ])
    );
  });
});

describe('FAQ section', () => {
  it('shows answered questions and hides ones awaiting the owner', () => {
    render(<FAQ />);
    expect(screen.getByText('How much does it cost?')).toBeTruthy();
    expect(screen.queryByText('Can we serve alcohol?')).toBeNull();
    expect(screen.queryByText('Are pets allowed?')).toBeNull();
  });

  it('opens and closes an answer and tells screen readers its state', () => {
    render(<FAQ />);
    const button = screen.getByRole('button', {
      name: 'How much does it cost?',
    });
    expect(button.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    const answer = document.getElementById(
      button.getAttribute('aria-controls') ?? ''
    );
    expect(answer?.textContent).toMatch(/Packages start at \$3,800/);

    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });
});
