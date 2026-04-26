import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../features/auth/services/auth.service';

export interface BotResponse {
  text: string;
  options?: string[];
}

export interface ChatbotApiResponse {
  statusCode: number;
  message: string;
  data: {
    response: string;
    sessionId: string;
    success: boolean;
    errorMessage: null | string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private apiUrl = `${environment.apiUrl}/ChatBot`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  sendMessage(message: string): Observable<ChatbotApiResponse> {
    const currentUser = this.authService.getCurrentUser();
    const payload = {
      Message: message,
      userId: currentUser?.id ?? null,
    };

    return this.http.post<ChatbotApiResponse>(
      `${this.apiUrl}/message`,
      payload,
    );
  }

  // Convert API response to BotResponse format
  formatResponse(apiResponse: ChatbotApiResponse): BotResponse {
    if (!apiResponse.data.success) {
      return {
        text:
          apiResponse.data.errorMessage ||
          'Sorry, I encountered an error. Please try again.',
        options: ['Try again', 'Help', 'Contact support'],
      };
    }

    return {
      text: apiResponse.data.response,
    };
  }
}
