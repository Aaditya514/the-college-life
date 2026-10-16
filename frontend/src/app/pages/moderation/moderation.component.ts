import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoryService } from '../../services/story.service';
import { ReportItem, AppealItem } from '../../models/story.model';

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="moderation-page">
      <div class="container">
        <!-- Workbench Header -->
        <header class="admin-header">
          <div>
            <div class="admin-badge-row">
              <span class="admin-badge">ADMINISTRATION & SAFETY WORKBENCH</span>
              <span class="prototype-tag live-badge">🤖 AI Content Safety Active</span>
            </div>
            <h1 class="admin-title">Editorial Moderation Desk</h1>
            <p class="admin-sub">
              Review flagged stories, examine reported privacy infringements, and maintain community safety.
            </p>
          </div>
          <div class="admin-actions">
            <span class="mod-status-indicator">
              <span class="pulse-dot"></span> Queue Live
            </span>
          </div>
        </header>

        <!-- KPI metrics -->
        <div class="kpi-grid">
          <div class="kpi-card card-editorial">
            <span class="kpi-num pending-num">{{ pendingCount }}</span>
            <span class="kpi-label">Reports Awaiting Review</span>
          </div>
          <div class="kpi-card card-editorial" [style.borderColor]="pendingAppealsCount > 0 ? '#F59E0B' : 'var(--color-border)'">
            <span class="kpi-num" style="color: #D97706;">{{ pendingAppealsCount }}</span>
            <span class="kpi-label">Student Appeals Pending</span>
          </div>
          <div class="kpi-card card-editorial">
            <span class="kpi-num">{{ reviewedCount }}</span>
            <span class="kpi-label">Actioned in Last 24h</span>
          </div>
          <div class="kpi-card card-editorial">
            <span class="kpi-num safe-num">98.4%</span>
            <span class="kpi-label">Community Compliance Rate</span>
          </div>
        </div>

        <!-- Filter tabs -->
        <div class="queue-filter-bar">
          <div class="tabs-group">
            <button 
              class="queue-tab" 
              [class.active]="activeTab === 'pending'"
              (click)="activeTab = 'pending'">
              Pending Reports ({{ pendingCount }})
            </button>
            <button 
              class="queue-tab" 
              [class.active]="activeTab === 'appeals'"
              (click)="activeTab = 'appeals'">
              Student Appeals ({{ pendingAppealsCount }})
            </button>
            <button 
              class="queue-tab" 
              [class.active]="activeTab === 'resolved'"
              (click)="activeTab = 'resolved'">
              Resolved History ({{ reviewedCount }})
            </button>
          </div>
        </div>

        <!-- Report Queue Table (For pending and resolved reports) -->
        @if (activeTab !== 'appeals') {
          <div class="card-editorial queue-card">
            <div class="table-responsive">
              <table class="reports-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Flagged Story</th>
                    <th>Reason Category</th>
                    <th>Reported By</th>
                    <th>Reported Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of filteredReports; track item.id) {
                    <tr>
                      <td><code>#{{ item.id }}</code></td>
                      <td>
                        <div class="table-story-title">{{ item.storyTitle }}</div>
                        <div class="table-details-excerpt">{{ item.details }}</div>
                      </td>
                      <td>
                        <span class="reason-chip">{{ item.reason }}</span>
                      </td>
                      <td>&#64;{{ item.reporterPseudonym }}</td>
                      <td class="time-col">{{ item.reportedAt }}</td>
                      <td>
                        <span class="status-chip" [ngClass]="item.status">
                          {{ item.status }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-secondary btn-sm" (click)="openReviewModal(item)">
                          Examine &rarr;
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Appeals Queue Table -->
        @if (activeTab === 'appeals') {
          <div class="card-editorial queue-card">
            <div class="table-responsive">
              <table class="reports-table">
                <thead>
                  <tr>
                    <th>Appeal ID</th>
                    <th>Flagged Story</th>
                    <th>Author</th>
                    <th>Student's Dispute Argument</th>
                    <th>Filed Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @if (appealsList.length === 0) {
                    <tr>
                      <td colspan="7" style="text-align: center; padding: 40px; color: var(--color-ink-muted);">
                        No appeals submitted by students. All automated moderation flags are current.
                      </td>
                    </tr>
                  }
                  @for (appeal of appealsList; track appeal.id) {
                    <tr>
                      <td><code>#{{ appeal.id.slice(0, 8) }}</code></td>
                      <td>
                        <div class="table-story-title">{{ appeal.storyTitle }}</div>
                        <div class="table-details-excerpt">{{ appeal.storyExcerpt }}</div>
                      </td>
                      <td>&#64;{{ appeal.authorPseudonym }}</td>
                      <td>
                        <div class="appeal-student-defense">"{{ appeal.reason }}"</div>
                      </td>
                      <td class="time-col">{{ appeal.createdAt ? appeal.createdAt.slice(0, 10) : 'Recent' }}</td>
                      <td>
                        <span class="status-chip" [ngClass]="appeal.status">
                          {{ appeal.status }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-secondary btn-sm" (click)="openAppealReviewModal(appeal)">
                          Adjudicate &rarr;
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Review Modal -->
        @if (selectedReport) {
          <div class="modal-backdrop fade-in">
            <div class="modal-card">
              <div class="modal-header">
                <div>
                  <span class="modal-eyebrow">Report Investigation</span>
                  <h3 class="modal-title">#{{ selectedReport.id }} — Review Flagged Story</h3>
                </div>
                <button class="close-modal-btn" (click)="closeReviewModal()">✕</button>
              </div>

              <div class="modal-body">
                <div class="investigation-meta-box">
                  <div><strong>Flagged Headline:</strong> {{ selectedReport.storyTitle }}</div>
                  <div><strong>Category:</strong> {{ selectedReport.reason }}</div>
                  <div><strong>Reporter:</strong> &#64;{{ selectedReport.reporterPseudonym }} ({{ selectedReport.reportedAt }})</div>
                </div>

                <div class="flagged-details-quote">
                  <span class="quote-lbl">Reporter's Note:</span>
                  <p>"{{ selectedReport.details }}"</p>
                </div>

                <div class="moderator-decision-section">
                  <label class="form-label">Moderator Resolution Note</label>
                  <textarea 
                    class="form-textarea" 
                    [(ngModel)]="resolutionNote" 
                    placeholder="Document action reason for internal audit logs..."></textarea>
                </div>
              </div>

              <div class="modal-footer">
                <button class="btn btn-ghost" (click)="closeReviewModal()">Cancel</button>
                <button class="btn btn-secondary" (click)="takeAction('dismissed')">
                  Dismiss (No Violation)
                </button>
                <button class="btn btn-secondary" (click)="takeAction('reviewed')">
                  Request Author Edit
                </button>
                <button class="btn btn-primary" (click)="takeAction('actioned')">
                  Remove Content
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Appeal Adjudication Modal -->
        @if (selectedAppeal) {
          <div class="modal-backdrop fade-in" (click)="closeAppealReviewModal()">
            <div class="modal-card scale-in" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <div>
                  <span class="modal-eyebrow">Student Dispute Adjudication</span>
                  <h3 class="modal-title">Appeal #{{ selectedAppeal.id.slice(0, 8) }} — {{ selectedAppeal.storyTitle }}</h3>
                </div>
                <button class="close-modal-btn" (click)="closeAppealReviewModal()">✕</button>
              </div>

              <div class="modal-body">
                <div class="investigation-meta-box">
                  <div><strong>Author:</strong> &#64;{{ selectedAppeal.authorPseudonym }}</div>
                  <div><strong>Current Status:</strong> <span class="status-chip" [ngClass]="selectedAppeal.status">{{ selectedAppeal.status }}</span></div>
                </div>

                <div class="flagged-details-quote">
                  <span class="quote-lbl">Student's Appeal Argument:</span>
                  <p>"{{ selectedAppeal.reason }}"</p>
                </div>

                <div>
                  <label class="form-label">Full Story Content Submitted by Student</label>
                  <div class="story-content-preview-box">
                    {{ selectedAppeal.storyContent || selectedAppeal.storyExcerpt }}
                  </div>
                </div>

                <div class="moderator-decision-section">
                  <label class="form-label">Internal Audit & Active Learning Notes</label>
                  <textarea 
                    class="form-textarea" 
                    [(ngModel)]="appealAdminNotes" 
                    placeholder="Document justification for machine learning active learning loop (e.g. 'Anand is a campus town in Gujarat, not a personal name; overrule flag')..."></textarea>
                </div>
              </div>

              <div class="modal-footer">
                <button class="btn btn-ghost" (click)="closeAppealReviewModal()">Cancel</button>
                <button class="btn btn-reject" (click)="resolveAppeal(false)">
                  ✕ Uphold Rejection
                </button>
                <button class="btn btn-approve" (click)="resolveAppeal(true)">
                  ✓ Overrule AI & Publish Story
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .moderation-page {
      padding: var(--space-3xl) 0 var(--space-4xl);
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-2xl);
      flex-wrap: wrap;
      gap: 16px;
    }

    .admin-badge-row {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 8px;
    }

    .admin-badge {
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #9B1C1C;
      background-color: #FDE8E8;
      border: 1px solid #F8B4B4;
      padding: 3px 10px;
      border-radius: var(--radius-sm);
    }

    .prototype-tag {
      font-size: 0.75rem;
      color: var(--color-ink-muted);
      background-color: var(--color-canvas-subtle);
      border: 1px solid var(--color-border);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
    }

    .admin-title {
      font-size: 2.5rem;
      margin-bottom: 6px;
    }
    .admin-sub {
      font-size: 1rem;
      color: var(--color-ink-secondary);
    }

    .mod-status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: #DEF7EC;
      color: #03543F;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 600;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background-color: #31C48D;
      border-radius: 50%;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: var(--space-2xl);
    }

    .kpi-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
    }
    .kpi-num {
      font-family: var(--font-serif);
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-ink);
    }
    .pending-num { color: #C81E1E; }
    .safe-num { color: #0E9F6E; }
    .kpi-label {
      font-size: 0.8rem;
      color: var(--color-ink-muted);
      text-transform: uppercase;
      margin-top: 4px;
    }

    .queue-filter-bar {
      display: flex;
      border-bottom: 2px solid var(--color-border);
      margin-bottom: 20px;
    }
    .queue-tab {
      padding: 10px 18px;
      background: none;
      border: none;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-ink-muted);
      cursor: pointer;
      position: relative;
    }
    .queue-tab.active {
      color: var(--color-accent-primary);
    }
    .queue-tab.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--color-accent-primary);
    }

    .queue-card {
      padding: 0;
      overflow: hidden;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .reports-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .reports-table th {
      background-color: var(--color-canvas-subtle);
      padding: 14px 18px;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-ink-muted);
      border-bottom: 1px solid var(--color-border);
    }

    .reports-table td {
      padding: 16px 18px;
      border-bottom: 1px solid var(--color-border-subtle);
      font-size: 0.88rem;
      color: var(--color-ink);
      vertical-align: middle;
    }

    .reports-table tr:hover td {
      background-color: var(--color-surface-hover);
    }

    .table-story-title {
      font-weight: 600;
      color: var(--color-ink);
      margin-bottom: 4px;
    }
    .table-details-excerpt {
      font-size: 0.8rem;
      color: var(--color-ink-muted);
      max-width: 300px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .reason-chip {
      background-color: #FEF3C7;
      color: #92400E;
      font-size: 0.78rem;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      white-space: nowrap;
    }

    .status-chip {
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }
    .status-chip.pending {
      background-color: #FDE8E8;
      color: #9B1C1C;
    }
    .status-chip.reviewed, .status-chip.actioned {
      background-color: #DEF7EC;
      color: #03543F;
    }
    .status-chip.dismissed {
      background-color: var(--color-canvas-subtle);
      color: var(--color-ink-muted);
    }

    .time-col {
      white-space: nowrap;
      color: var(--color-ink-muted);
      font-size: 0.8rem;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(27, 30, 33, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }
    .modal-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 600px;
      box-shadow: var(--shadow-lift);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }
    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-eyebrow {
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--color-accent-primary);
    }
    .modal-title {
      font-size: 1.25rem;
      margin-top: 2px;
    }
    .close-modal-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--color-ink-muted);
    }
    .modal-body {
      padding: 24px;
    }
    .investigation-meta-box {
      background-color: var(--color-canvas);
      border: 1px solid var(--color-border);
      padding: 14px;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .flagged-details-quote {
      background-color: #FFFBEB;
      border-left: 3px solid #F59E0B;
      padding: 12px 16px;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      margin-bottom: 20px;
    }
    .quote-lbl {
      font-size: 0.75rem;
      font-weight: 700;
      color: #92400E;
      text-transform: uppercase;
    }
    .flagged-details-quote p {
      font-size: 0.9rem;
      color: #78350F;
      margin-top: 4px;
    }

    .status-chip.APPROVED {
      background-color: rgba(16, 185, 129, 0.12);
      color: #047857;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .status-chip.REJECTED {
      background-color: rgba(239, 68, 68, 0.12);
      color: #B91C1C;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .status-chip.PENDING {
      background-color: rgba(245, 158, 11, 0.12);
      color: #B45309;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .appeal-student-defense {
      font-size: 0.88rem;
      color: #B45309;
      background-color: rgba(245, 158, 11, 0.08);
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      border-left: 2px solid #F59E0B;
      font-style: italic;
    }
    .story-content-preview-box {
      background-color: var(--color-canvas);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      font-size: 0.88rem;
      line-height: 1.5;
      max-height: 180px;
      overflow-y: auto;
      margin-top: 6px;
      margin-bottom: 16px;
      white-space: pre-wrap;
    }
    .btn-approve {
      background-color: #059669;
      color: white;
      border: none;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background-color 0.15s ease;
    }
    .btn-approve:hover {
      background-color: #047857;
    }
    .btn-reject {
      background-color: #DC2626;
      color: white;
      border: none;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background-color 0.15s ease;
    }
    .btn-reject:hover {
      background-color: #B91C1C;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border);
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      background-color: var(--color-canvas-subtle);
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ModerationComponent implements OnInit {
  storyService = inject(StoryService);
  activeTab: 'pending' | 'resolved' | 'appeals' = 'pending';

  selectedReport: ReportItem | null = null;
  resolutionNote = '';

  selectedAppeal: AppealItem | null = null;
  appealAdminNotes = '';

  ngOnInit(): void {
    this.storyService.loadAppealsFromBackend();
    this.storyService.loadReportsFromBackend();
  }

  get pendingCount(): number {
    return this.storyService.reports().filter(r => r.status === 'pending').length;
  }

  get reviewedCount(): number {
    return this.storyService.reports().filter(r => r.status !== 'pending').length;
  }

  get pendingAppealsCount(): number {
    return this.storyService.appeals().filter(a => a.status === 'PENDING').length;
  }

  get appealsList(): AppealItem[] {
    return this.storyService.appeals();
  }

  get filteredReports(): ReportItem[] {
    if (this.activeTab === 'pending') {
      return this.storyService.reports().filter(r => r.status === 'pending');
    }
    return this.storyService.reports().filter(r => r.status !== 'pending');
  }

  openReviewModal(item: ReportItem): void {
    this.selectedReport = item;
    this.resolutionNote = '';
  }

  closeReviewModal(): void {
    this.selectedReport = null;
  }

  openAppealReviewModal(item: AppealItem): void {
    this.selectedAppeal = item;
    this.appealAdminNotes = '';
  }

  closeAppealReviewModal(): void {
    this.selectedAppeal = null;
  }

  resolveAppeal(approve: boolean): void {
    if (this.selectedAppeal) {
      this.storyService.resolveAppeal(this.selectedAppeal.id, approve, this.appealAdminNotes);
      this.closeAppealReviewModal();
    }
  }

  takeAction(status: 'reviewed' | 'actioned' | 'dismissed'): void {
    if (this.selectedReport) {
      const actionMap: Record<string, 'DISMISS' | 'REMOVE_STORY' | 'WARN_AUTHOR'> = {
        dismissed: 'DISMISS',
        actioned: 'REMOVE_STORY',
        reviewed: 'WARN_AUTHOR'
      };
      const backendAction = actionMap[status] || 'DISMISS';
      this.storyService.takeModerationAction(this.selectedReport.id, backendAction, this.resolutionNote);
      this.closeReviewModal();
    }
  }
}
