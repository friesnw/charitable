import type { Meta, StoryObj } from '@storybook/react-vite';
import { H1, H2, H3, H4, Body, Caption } from './Typography';

const meta = {
  title: 'UI/Typography',
  component: H1,
  tags: ['autodocs'],
} satisfies Meta<typeof H1>;

export default meta;

export const Heading1: StoryObj = {
  render: () => <H1>Find Nonprofits Near You</H1>,
};

export const Heading2: StoryObj = {
  render: () => <H2>Denver Charities</H2>,
};

export const Heading3: StoryObj = {
  render: () => <H3>Denver Rescue Mission</H3>,
};

export const Heading4: StoryObj = {
  render: () => <H4>About This Charity</H4>,
};

export const BodyText: StoryObj = {
  render: () => <Body>Discover trusted Denver nonprofits and start giving better.</Body>,
};

export const CaptionText: StoryObj = {
  render: () => <Caption>Founded in 1892</Caption>,
};
