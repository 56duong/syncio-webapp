import { Injectable } from '@angular/core';
import { Octokit } from '@octokit/rest';
import { environment } from 'src/environments/environment';
import { TokenService } from './token.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})

export class GithubService {

  private GITHUB_TOKEN = environment.githubToken;
  private REPO_OWNER = '56duong';
  private REPO_NAME = 'syncio-webapp-user-reports';
  private BRANCH_NAME = 'master';
  octokit: Octokit;

  constructor(
    private tokenService: TokenService,
  ) { 
    this.octokit = new Octokit({
      auth: this.GITHUB_TOKEN
    });

    console.log('GithubService initialized', this.GITHUB_TOKEN);
  }


  /**
   * Upload images to GitHub
   * @param files 
   * @param reportType 
   * @returns the URLs of the uploaded images. Example: ['https://github.com/56duong/syncio-webapp-user-repo…b52d51c6-d4ab-42df-9607-6e00d9d2e06a.png?raw=true, ...]
   */
  async uploadImage(files: File[], reportType: 'bug' | 'improve'): Promise<string[]> {
    const imageUrls: string[] = [];
  
    for (const file of files) {
      const fileReader = new FileReader();
      const generateFileName = () => uuidv4() + '.' + file.name.split('.').pop();
      let fileName = generateFileName();
      const folderPath = reportType === 'bug' ? 'bug-reports' : 'help-us-improve';
      const filePath = `${folderPath}/${fileName}`;
  
      const base64Image = await new Promise<string>((resolve, reject) => {
        fileReader.onload = () => resolve((fileReader.result as string).split(',')[1]);
        fileReader.onerror = () => reject(new Error('Failed to read file'));
        fileReader.readAsDataURL(file);
      });
  
      try {
        // Check if the file already exists to get its SHA
        let sha: string | undefined;
        const response = await this.octokit.request(`PUT /repos/{owner}/{repo}/contents/${filePath}`, {
          owner: this.REPO_OWNER,
          repo: this.REPO_NAME,
          path: filePath,
          message: `Add ${reportType} report image: ${fileName} by ${this.tokenService.extractUserIdFromToken()}`,
          content: base64Image,
          branch: this.BRANCH_NAME,
          sha, // Include the SHA if the file already exists
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });
  
        if (response && response.data && response.data.content && response.data.content._links && response.data.content._links.html) {
          imageUrls.push(response.data.content._links.html + '?raw=true');
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    }
  
    return imageUrls;
  }


  /**
   * Create an issue on GitHub
   * @param title 
   * @param body 
   * @param reportType 
   * @param imageUrl the URLs of the uploaded images. Example: ['https://github.com/56duong/syncio-webapp-user-repo…5f083dd9-c5a7-46a7-bcfd-4e13ba830578.png?raw=true', ...]
   */
  async createIssue(title: string, body: string, reportType: 'bug' | 'improve', imageUrl: string[]): Promise<any> {
    const userId = this.tokenService.extractUserIdFromToken();
    const baseUrl = window.location.origin;
    const userProfileUrl = `${baseUrl}/profile/${userId}`;

    const issueBody = `
### User Report

**Created by:** [${userId}](${userProfileUrl})

**Title:** ${title}

**Feedback:**
${body}

**Attached Images:**

${imageUrl.map(url => `![image](${url})`).join('\n')}
    `;

    const octokit = new Octokit({
      auth: this.GITHUB_TOKEN
    });

    await octokit.request('POST /repos/{owner}/{repo}/issues', {
      owner: this.REPO_OWNER,
      repo: this.REPO_NAME,
      title: title,
      body: issueBody,
      labels: [
        reportType === 'bug' ? 'bug-reports' : 'help-us-improve'
      ],
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).then(response => {
      if(response && response.data && response.data.html_url) {
        return response.data.html_url;
      }
      return null;
    }).catch(error => {
      console.log(error);
    });
  }


  /**
   * Get all issues from GitHub with the state 'all'
   * @returns all issues
   */
  getAllIssues(): Promise<any> {
    return this.octokit.request('GET /repos/{owner}/{repo}/issues', {
      owner: this.REPO_OWNER,
      repo: this.REPO_NAME,
      state: 'all',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).then(response => {
      if(response && response.data) {
        return response.data;
      }
      return null;
    }).catch(error => {
      console.log(error);
    });
  }


  /**
   * Extract the user ID from the github markdown. Example: **Created by:** [c272d4a1-c1aa-4c30-b4ec-f8606f374773](http://localhost:4200/profile/c272d4a1-c1aa-4c30-b4ec-f8606f374773)
   * @param issueBody 
   * @returns the user ID if found, otherwise return null. Example: 'c272d4a1-c1aa-4c30-b4ec-f8606f374773'
   */
  extractUserIdFromIssueBody(issueBody: string): string | null {
    // Define the regular expression to match the user ID pattern
    const userIdPattern = /\*\*Created by:\*\* \[([^\]]+)\]/;
    // Execute the regular expression on the issueBody
    const match = issueBody.match(userIdPattern);  
    // Return the user ID if found, otherwise return null
    return match ? match[1] : null;
  }


  /**
   * Get all labels from GitHub
   * @returns all labels
   */
  getAllLabels(): Promise<any> {
    return this.octokit.request('GET /repos/{owner}/{repo}/labels', {
      owner: this.REPO_OWNER,
      repo: this.REPO_NAME,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).then(response => {
      if(response && response.data) {
        return response.data;
      }
      return null;
    }).catch(error => {
      console.log(error);
    });
  }


  /**
   * Get all assignees from GitHub
   * @returns 
   */
  getAllAssignees(): Promise<any> {
    return this.octokit.request('GET /repos/{owner}/{repo}/assignees', {
      owner: this.REPO_OWNER,
      repo: this.REPO_NAME,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).then(response => {
      if(response && response.data) {
        return response.data;
      }
      return null;
    }).catch(error => {
      console.log(error);
    });
  }


  /**
   * Get the image from the GitHub URL. It will convert the base64 content to a blob and return the URL of the blob. Cause the image is in a private repository, we need to use the GitHub API to get the image.
   * @param imagePath the image URL. Example: 'https://github.com/56duong/syncio-webapp-user-reports/blob/master/bug-reports/8a31dd18-eccd-40c0-af03-aac2e7553abb.png?raw=true' 
   * @returns the URL of the blob. Example: 'blob:http://localhost:4200/340a4174-5c8f-42a5-9fa2-2794c545a5f8'
   */
  async getImage(imagePath: string): Promise<any> {
    imagePath = imagePath.replace('https://github.com/', '')
                     .replace(`${this.REPO_OWNER}/${this.REPO_NAME}/blob/${this.BRANCH_NAME}/`, '')
                     .replace('?raw=true', '');
    return this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: this.REPO_OWNER,
      repo: this.REPO_NAME,
      path: imagePath,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).then((response: any) => {
      if (response && response.data && response.data) {
        const base64Content = response.data.content;
        const binaryContent = atob(base64Content);
        const byteNumbers = new Array(binaryContent.length);
        for (let i = 0; i < binaryContent.length; i++) {
          byteNumbers[i] = binaryContent.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpg' });
        return URL.createObjectURL(blob);
      }
      return null;
    }).catch(error => {
      console.log(error);
    });
  }


  /**
   * Replace the image URLs in the text with the blob URLs
   * @param text 
   * @returns 
   */
  async replaceImageUrls(text: string): Promise<string> {
    const regex = /!\[image\]\((https:\/\/github\.com\/56duong\/[^\)]+\?raw=true)\)/g;
    let match;
    const promises = [];
  
    while ((match = regex.exec(text)) !== null) {
      const imageUrl = match[1];
      promises.push(this.getImage(imageUrl).then(dataUrl => {
        if (dataUrl) {
          text = text.replace(imageUrl, dataUrl);
        }
      }));
    }
    await Promise.all(promises);
    return text;
  }


  /**
   * Create a comment on GitHub issue
   * @param issueNumber 
   * @param body 
   * @returns 
   */
  createComment(issueNumber: number, body: string): Promise<any> {
    const userId = this.tokenService.extractUserIdFromToken();
    const baseUrl = window.location.origin;
    const userProfileUrl = `${baseUrl}/profile/${userId}`;
    body = `**Created by:** [${userId}](${userProfileUrl})\n\n${body}`;
    return this.octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner: this.REPO_OWNER,
      repo: this.REPO_NAME,
      issue_number: issueNumber,
      body: body,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).then(response => {
      if(response && response.data) {
        return response.data;
      }
      return null;
    }).catch(error => {
      console.log(error);
    });
  }


  /**
   * Get all comments from GitHub issue
   * @param issueNumber 
   * @returns 
   */
  getAllComments(issueNumber: number): Promise<any> {
    return this.octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner: this.REPO_OWNER,
      repo: this.REPO_NAME,
      issue_number: issueNumber,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).then(response => {
      if(response && response.data) {
        return response.data;
      }
      return null;
    }).catch(error => {
      console.log(error);
    });
  }


  /**
   * Update the assignees of the GitHub issue
   * @param issueNumber 
   * @param assignees an array of assignees. Example: ['56duong', 'user2']
   * @returns 
   */
  updateAssignees(issueNumber: number, assignees: string[]): Promise<any> {
    return this.octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
      owner: this.REPO_OWNER,
      repo: this.REPO_NAME,
      issue_number: issueNumber,
      assignees: assignees,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).then(response => {
      if(response && response.data) {
        return response.data;
      }
      return null;
    }).catch(error => {
      console.log(error);
    });
  }


  /**
   * Update the state of the GitHub issue
   * @param issueNumber 
   * @param state 
   * @returns 
   */
  updateIssueState(issueNumber: number, state: 'open' | 'closed'): Promise<any> {
    return this.octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
      owner: this.REPO_OWNER,
      repo: this.REPO_NAME,
      issue_number: issueNumber,
      state: state,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).then(response => {
      if(response && response.data) {
        return response.data;
      }
      return null;
    }).catch(error => {
      console.log(error);
    });
  }

}
