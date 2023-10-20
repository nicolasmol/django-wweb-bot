interface IRule {
  id: string;
  receivedMessageAsRex: string;
  stopAtFirstMatch?: boolean;
  ifNoMatch?: IRuleAction;
  pauseRuleInSeconds?: number;
  ifPaused?: IRuleAction;
  ifMatch?: IRuleAction;
  rules?: IRule[];
  matches?: Record<string, IRuleAction>;
}

interface IRuleAction {
  doBeforeReply?: string;
  replyMessages?: string[];
  doAfterReply?: string;
  thenGoToRuleId?: string;
}

export { IRule };
