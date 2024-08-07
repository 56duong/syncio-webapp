import { Component, OnInit, OnDestroy } from '@angular/core';

import { Chart, registerables } from 'chart.js';
import { enUS } from 'date-fns/locale';
import 'chartjs-adapter-date-fns';
import { UserService } from 'src/app/core/services/user.service';
import { PostService } from 'src/app/core/services/post.service';
import { User } from 'src/app/core/interfaces/user';
// import * as XLSX from 'xlsx';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  totalUsers: number = 0;
  totalPosts : number = 0;
  totalComments : number = 0;
  totalLikes : number = 0;
  totalPostsReported: number = 0;
  outstandingUsers: User[] = [];
  public selectedDays: number = 7;

  public daysOptions = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 60 days', value: 60}
  ]; // Options for ng-select dropdown
  private charts: Chart[] = [];

  constructor(private userService: UserService, private postService: PostService) {
    // Register all necessary Chart.js components
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.getDataAndCreateCharts();    
  }

  getDataAndCreateCharts() {
    this.getTotalUsers();
    this.getTotalPosts();
    this.getTotalPostsReported();
    this.getOutstandingUsers();
    this.getEngagementMetrics();
    this.getNewUsersChartData();
  }
  ngOnDestroy() {
    // Destroy all charts to prevent memory leaks
    this.charts.forEach(chart => chart.destroy());
  }

  getEngagementMetrics() {
    this.postService.getEngagementMetrics(this.selectedDays).subscribe(data => {
      this.totalLikes = data.likes;
      this.totalComments = data.comments;
      this.createChartEngagementMetrics();
    });
  }

  getNewUsersChartData() {
    const startDate = new Date();
    startDate.setDate(startDate.getDate()  - this.selectedDays); // Adjust start date based on selected days
    
    this.userService.getNewUsersLastNDays(this.selectedDays).subscribe(data => {
      const dates = [];
      const counts = [];

      for (let i = this.selectedDays ; i >= 0; i--) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        dates.push(currentDate);

        const dateString = currentDate.toISOString().split('T')[0];
        counts.push(data[dateString] || 0); // Get count for current date or 0 if not available
      }

      const canvasId = 'newUsersChart';
      const label = `New Users in Last ${this.selectedDays} Days`;

      const chart = new Chart(canvasId, {
        type: 'bar',
        data: {
          labels: dates,
          datasets: [
            {
              label: label,
              data: counts,
              backgroundColor: 'rgba(60, 186, 159, 0.5)',
              borderColor: '#3cba9f',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day'
              },
              adapters: {
                date: {
                  locale: enUS
                }
              },
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 0.5
              },
              title: {
                display: true,
                text: 'Number of New Users'
              }
            }
          }
        }
      });

      this.charts.push(chart);
    });
  }
  createChartEngagementMetrics() {
    const canvasId = 'engagementChart';
    const label = `Engagement Metrics in Last ${this.selectedDays} Days`;

    const chart = new Chart(canvasId, {
      type: 'bar',
      data: {
        labels: ['Likes', 'Comments'],
        datasets: [
          {
            label: label,
            data: [this.totalLikes, this.totalComments],
            backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 159, 64, 0.5)'],
            borderColor: ['#4bc0c0', '#ff9f40'],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Metric'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count'
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }
  selectDays() {
    // Remove existing chart
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
    // Create chart with new selected days
    this.getDataAndCreateCharts();
    
  }

  getTotalUsers() {
    this.userService.getUsers().subscribe(users => {
      this.totalUsers = users.length;
    })
  }

  getTotalPosts() {
    this.postService.getTotalPostsCount().subscribe(count => {
      this.totalPosts = count;
    });
  }

  getTotalPostsReported() {
    this.postService.getTotalPostReported().subscribe(count => {
      this.totalPostsReported = count;
    });
  }

  getOutstandingUsers() {
    this.userService.getOutstandingUsers().subscribe(users => {
      this.outstandingUsers = users;
      console.log('outstanding users :', this.outstandingUsers);
    });
  }

  // New method to export data to Excel
  exportToExcel() {
    // Prepare the summary data with headers
    const summaryData = [
      { Metric: 'Metric', Value: 'Value' },
      { Metric: 'Total Users', Value: this.totalUsers },
      { Metric: 'Total Posts', Value: this.totalPosts },
      { Metric: 'Total Posts Reported', Value: this.totalPostsReported }
    ];
  
    // Convert outstanding users to a suitable format with headers
    const outstandingUsersHeader = [{ Username: 'Username', Email: 'Email' }];
    const outstandingUsersData = this.outstandingUsers.map(user => ({
      Username: user.username,
      Email: user.email,
      // Add other fields as necessary
    }));
  
    // Combine the datasets with a gap row in between
    const combinedData = [
      ...summaryData,
      {}, // Empty row to separate sections
      { Metric: 'Outstanding Users', Value: '' }, // Section header
      ...outstandingUsersHeader.map(header => ({
        Metric: header.Username,
        Value: header.Email
      })),
      ...outstandingUsersData.map(user => ({
        Metric: user.Username,
        Value: user.Email
      }))
    ];
  
    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(combinedData, { skipHeader: true });
  
    // Apply bold style to the summary header row
    const boldStyle = {
      font: {
        bold: true
      }
    };
  
    // Apply bold style to the "Metric" and "Value" headers in the summaryData
    for (let col = 0; col < 2; col++) {
      const cellAddress = XLSX.utils.encode_cell({ c: col, r: 0 });
      if (ws[cellAddress]) {
        ws[cellAddress].s = boldStyle;
      }
    }
  
    // Apply bold style to the "Outstanding Users" header row
    for (let R = 0; R < combinedData.length; R++) {
      const cellAddress = XLSX.utils.encode_cell({ c: 0, r: R });
      if (ws[cellAddress] && ws[cellAddress].v === 'Outstanding Users') {
        ws[cellAddress].s = boldStyle;
        break;
      }
    }
  
    // Create a new workbook and append the sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DashboardData');
  
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, 'DashboardData.xlsx');
  }

  exportChartAsImage() {
    setTimeout(() => {
      const chart = this.charts[0]; // Assuming the first chart is newUsersChart
      if (chart) {
        const base64Image = chart.toBase64Image();
        const blob = this.base64ToBlob(base64Image.split(',')[1], 'image/png');
        saveAs(blob, 'chart-new-users.png');
      } else {
        console.error('Chart instance not found');
      }

      const engagementChart = this.charts[1]; // Assuming the second chart is engagementChart
      if (engagementChart) {
        const base64Image = engagementChart.toBase64Image();
        const blob = this.base64ToBlob(base64Image.split(',')[1], 'image/png');
        saveAs(blob, 'chart-engagement.png');
      } else {
        console.error('Engagement chart instance not found');
      }
    }, 100);
  }

  private base64ToBlob(base64: string, type: string): Blob {
    const binary = atob(base64);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: type });
  }
  
}
