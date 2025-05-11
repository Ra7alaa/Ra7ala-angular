import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface CompanyProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  logoUrl: string;
  averageRating: number;
  totalRatings: number;
  website?: string;
}

export interface FeedbackRequest {
  rating: number;
  comment: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  data?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private apiBaseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCompanyProfile(id: number): Observable<CompanyProfile> {
    return this.http
      .get<CompanyProfile>(
        `${this.apiBaseUrl}/api/Company/${id}/Company-User-profile`
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching company profile:', error);
          return throwError(() => new Error('Failed to load company profile'));
        })
      );
  }

  submitFeedback(
    companyId: number,
    feedback: FeedbackRequest
  ): Observable<FeedbackResponse> {
    if (!this.isValidFeedback(feedback)) {
      return throwError(() => new Error('Invalid feedback data'));
    }

    return this.http
      .post<FeedbackResponse>(
        `${this.apiBaseUrl}/api/Company/${companyId}/Feedback`,
        feedback
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error submitting feedback:', error);
          const message = error.error?.message || 'Failed to submit feedback';
          return throwError(() => new Error(message));
        })
      );
  }

  private isValidFeedback(feedback: FeedbackRequest): boolean {
    return (
      feedback.rating >= 1 &&
      feedback.rating <= 5 &&
      typeof feedback.comment === 'string' &&
      feedback.comment.trim().length >= 10
    );
  }
}
