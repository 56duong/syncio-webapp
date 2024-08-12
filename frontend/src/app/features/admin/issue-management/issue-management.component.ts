import { Component } from '@angular/core';
import { Marked } from 'marked';
import { Table } from 'primeng/table';
import { GithubService } from 'src/app/core/services/github.service';
import { FilterService } from 'primeng/api';
import { UserService } from 'src/app/core/services/user.service';
import { firstValueFrom } from 'rxjs';
import { TokenService } from 'src/app/core/services/token.service';
import { LoadingService } from 'src/app/core/services/loading.service';

@Component({
  selector: 'app-issue-management',
  templateUrl: './issue-management.component.html',
  styleUrls: ['./issue-management.component.scss'],
  providers: [Marked]
})

export class IssueManagementComponent {
  /** All issues on the table */
  issues: any[] = [];
  /** All assignees in the repository */
  assignees: any[] = [];
  /** All labels in the repository */
  labels!: any[];
  /** Loading state of the table */
  loading: boolean = true;

  /** State of the issue details modal */
  isVisibleDetails: boolean = false;
  /** Selected issue to show details */
  selectedIssue: any = null;
  /** Comment to be submitted */
  comment: string = '';
  /** Selected assignees to be updated */
  selectedAssignees: any[] = [];
  /** State of the assignees modal to check if assignees are changed */
  isChangeAssignees: boolean = false;

  constructor(
    public githubService: GithubService,
    public marked: Marked,
    private filterService: FilterService,
    private userService: UserService,
    private tokenService: TokenService,
    private loadingService: LoadingService,
  ) {}


  ngOnInit() {
    this.registerLabelFilter();
    this.registerAssigneesFilter();
    this.registerStateFilter();

    this.githubService.getAllIssues().then(async (issues) => {
      this.issues = issues;
      this.loading = false;
      this.issues = await Promise.all(this.issues.map(async (issue: any) => {
        return {
          ...issue,
          body: await this.githubService.replaceImageUrls(issue.body),
        };
      }));
    });

    this.getAllAssignees();
    this.getAllLabels();
  }


  clear(table: Table) {
    table.clear();
  }


  registerLabelFilter() {
    this.filterService.register('labelFilter', (value: any, filter: any): boolean => {
      if (filter === undefined || filter === null || filter.trim() === '') {
        return true;
      }
      if (value === undefined || value === null) {
        return false;
      }
      return value[0].name.includes(filter);
    });
  }


  registerAssigneesFilter() {
    this.filterService.register('assigneesFilter', (value: any, filter: any): boolean => {
      if (filter === undefined || filter === null || filter.length === 0) {
        return true;
      }
      if (value === undefined || value === null || value.length === 0) {
        return false;
      }
      return value[0].login === filter[0].name;
    });
  }


  registerStateFilter() {
    this.filterService.register('stateFilter', (value: any, filter: any): boolean => {
      if (filter === undefined || filter === null) {
        return true;
      }
      return (filter && value === 'open') || (!filter && value === 'closed');
    });
  }


  async getAllLabels() {
    const gitLabels = await this.githubService.getAllLabels();
    this.labels = gitLabels.map((label: any) => {
      return {
        label: label.name,
        value: label.name,
        color: label.color,
      };
    });
  }


  async getAllAssignees() {
    const gitAssignments = await this.githubService.getAllAssignees();
    this.assignees = gitAssignments.map((assignment: any) => {
      return {
        name: assignment.login,
        avatar_url: assignment.avatar_url,
      };
    });
  }


  async showDetails(issue: any) {
    this.isChangeAssignees = false;
    this.selectedIssue = {...issue};
    this.isVisibleDetails = true;
    
    // Replace user id with username in issue body
    let bodyUserId = this.githubService.extractUserIdFromIssueBody(this.selectedIssue.body);
    let username = await firstValueFrom(this.userService.getUsernameById(bodyUserId || '')).then((response: any) => response.username);
    const htmlSnippet = `[${bodyUserId}](${window.location.origin}/profile/${bodyUserId})`;
    this.selectedIssue.body = this.selectedIssue.body.replace(htmlSnippet, `[${username}](${window.location.origin}/profile/${bodyUserId})`);

    // Get all comments of the issue
    this.githubService.getAllComments(this.selectedIssue.number).then(async (comments) => {
      // Replace user id with username in comments
      this.selectedIssue.comments = await Promise.all(comments.map(async (comment: any) => {
        let userId = this.githubService.extractUserIdFromIssueBody(comment.body);
        if(userId) {
          let username = await firstValueFrom(this.userService.getUsernameById(userId || '')).then((response: any) => response.username);
          comment.body = this.replaceCreatedBy(comment.body);
          comment.created_by = {
            id: userId,
            username: username,
          };
        }
        return {
          ...comment,
          body: await this.githubService.replaceImageUrls(comment.body),
        };
      }));
    });

    // Get all assignees of the issue
    this.selectedAssignees = this.selectedIssue.assignees.map((assignee: any) => {
      return assignee.login
    });
  }


  /**
   * Replace created by with empty string in the issue body.
   * @param text 
   * @returns 
   */
  replaceCreatedBy(text: string) {
    let userId = this.githubService.extractUserIdFromIssueBody(text);
    const htmlSnippet = `**Created by:** [${userId}](http://localhost:4200/profile/${userId})`;
    return text.replace(htmlSnippet, '');
  }


  /**
   * Submit comment to the selected issue.
   */
  onCommentSubmit() {
    if (this.comment.trim() === '') {
      return;
    }

    this.githubService.createComment(this.selectedIssue.number, this.comment).then((response) => {
      this.selectedIssue.comments = [
        ...this.selectedIssue.comments,
        {
          body: this.comment,
          created_at: new Date(),
          created_by: {
            id: this.tokenService.extractUserIdFromToken(),
            username: 'You',
          },
        },
      ];
      
      this.comment = '';
    });
  }


  /**
   * Save assignees to the selected issue. If assignees are changed.
   */
  saveAssignees() {
    if(!this.isChangeAssignees) return;

    this.githubService.updateAssignees(this.selectedIssue.number, this.selectedAssignees).then((response) => {
      // Update in the selected issue
      this.selectedIssue = {
        ...this.selectedIssue,
        assignees: response.assignees,
      };
      // Update on the table
      this.issues = this.issues.map((issue) => {
        if(issue.number === this.selectedIssue.number) {
          issue.assignees = response.assignees;
        }
        return issue;
      });
      this.isChangeAssignees = false;
    });
  }


  /**
   * Update issue state to open or closed.
   * @param state 
   */
  onUpdateIssueState(state: "open" | "closed") {
    this.loadingService.show();
    this.githubService.updateIssueState(this.selectedIssue.number, state).then((response) => {
      // Update in the selected issue
      this.selectedIssue = {
        ...this.selectedIssue,
        state: state,
      };
      // Update on the table
      this.issues = this.issues.map((issue) => {
        if(issue.number === this.selectedIssue.number) {
          issue.state = state;
        }
        return issue;
      });
      this.loadingService.hide();
    });
  }


}
