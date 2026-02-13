export type StepCode = 'D1'|'D2'|'D3'|'D4'|'D5'|'D6'|'D7'|'D8'
export type StepStatus = 'draft'|'submitted'|'validated'

export type StepMeta = {
  code: StepCode
  title: string
  subtitle: string
}

export const STEPS: StepMeta[] = [
  { code:'D1', title:'Establish the Team', subtitle:'Team & responsibilities' },
  { code:'D2', title:'Describe the Problem', subtitle:'4W2H + IS/IS NOT + preuves' },
  { code:'D3', title:'Containment', subtitle:'Develop Interim Containment Action' },
  { code:'D4', title:'Root Causes', subtitle:'4M+Env + 5 Whys (occurrence & non-detection)' },
  { code:'D5', title:'Corrective Actions', subtitle:'Occurence / Detection +evidence' },
  { code:'D6', title:'Effectiveness Check', subtitle:'Implementing Corrective Actions and Tracking Effectiveness' },
  { code:'D7', title:'Prevention', subtitle:'Establishing Preventive Actions' },
  { code:'D8', title:'Closure', subtitle:'Recognize Team and Individual Contributions' },
]
