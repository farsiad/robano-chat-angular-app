import { RobanoChatAppPage } from './app.po';

describe('robano-chat-app App', () => {
  let page: RobanoChatAppPage;

  beforeEach(() => {
    page = new RobanoChatAppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
