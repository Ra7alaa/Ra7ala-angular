import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatbotService } from '../../services/chatbot.service';

interface ChatMessage {
  text: string;
  safeHtml?: SafeHtml;
  isUser: boolean;
  timestamp: Date;
  options?: string[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  isOpen = false;
  messages: ChatMessage[] = [];
  newMessage = '';
  isBotTyping = false;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(
    private chatbotService: ChatbotService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    // Add welcome message
    this.addBotMessage(
      'Hello! Welcome to Ra7ala Assistant! How can I help you today?',
      [
        'When will the next trip be?',
        'Give me trips from Cairo to Alexandria',
        'I want all trips will be available tomorrow',
      ],
    );
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage(text?: string) {
    const messageToSend = text || this.newMessage;
    if (!messageToSend.trim()) return;

    // Add user message
    this.addUserMessage(messageToSend);
    this.newMessage = '';

    // Simulate bot typing
    this.isBotTyping = true;

    // Send message to API
    this.chatbotService.sendMessage(messageToSend).subscribe({
      next: (response) => {
        this.isBotTyping = false;
        const botResponse = this.chatbotService.formatResponse(response);
        this.addBotMessage(botResponse.text, botResponse.options);
      },
      error: (error) => {
        console.error('Chatbot API error:', error);
        this.isBotTyping = false;
        this.addBotMessage(
          'I apologize, but I encountered an error. Please try again.',
          ['Try again', 'Help', 'Contact support'],
        );
      },
    });
  }

  private addUserMessage(text: string) {
    this.messages.push({
      text,
      isUser: true,
      timestamp: new Date(),
    });
  }

  private addBotMessage(text: string, options?: string[]) {
    // parseMarkdown escapes all HTML from the source text first (& < >)
    // before injecting only safe <strong>, <ul>, <li>, <br> tags.
    // bypassSecurityTrustHtml is safe here because the input is sanitized.
    this.messages.push({
      text,
      safeHtml: this.sanitizer.bypassSecurityTrustHtml(
        this.parseMarkdown(text),
      ),
      isUser: false,
      timestamp: new Date(),
      options,
    });
  }

  parseMarkdown(text: string): string {
    const lines = text.split('\n');
    const segments: string[] = [];
    let listItems: string[] = [];
    let inList = false;

    for (const line of lines) {
      // Escape HTML
      const esc = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const bulletMatch = esc.match(/^(?:[*-])\s+(.*)/);
      if (bulletMatch) {
        inList = true;
        const item = bulletMatch[1].replace(
          /\*\*(.*?)\*\*/g,
          '<strong>$1</strong>',
        );
        listItems.push(`<li>${item}</li>`);
      } else {
        if (inList) {
          segments.push(`<ul class="bot-list">${listItems.join('')}</ul>`);
          listItems = [];
          inList = false;
        }
        if (esc.trim() === '') {
          if (segments.length && segments[segments.length - 1] !== '')
            segments.push('');
        } else {
          const content = esc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          segments.push(content);
        }
      }
    }

    if (inList)
      segments.push(`<ul class="bot-list">${listItems.join('')}</ul>`);

    return segments.join('<br>');
  }

  private scrollToBottom(): void {
    const container = this.messagesContainer?.nativeElement;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
