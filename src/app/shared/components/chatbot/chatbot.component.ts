import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, BotResponse } from '../../services/chatbot.service';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
  options?: string[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  isOpen = false;
  messages: ChatMessage[] = [];
  newMessage = '';
  isBotTyping = false;

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit() {
    // Add welcome message
    this.addBotMessage('Hello! Welcome to Ra7ala Assistant! How can I help you today?', [
      'When is the next trip?',
      'How can I book a ticket?',
      'What are the ticket prices?',
      'Where are the departure locations?'
    ]);
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

    // Get response from service
    this.chatbotService.getResponse(messageToSend).subscribe({
      next: (response: BotResponse) => {
        this.isBotTyping = false;
        this.addBotMessage(response.text, response.options);
      },
      error: () => {
        this.isBotTyping = false;
        this.addBotMessage('I apologize, but I encountered an error. Please try again.');
      }
    });
  }

  private addUserMessage(text: string) {
    this.messages.push({
      text,
      isUser: true,
      timestamp: new Date()
    });
  }

  private addBotMessage(text: string, options?: string[]) {
    this.messages.push({
      text,
      isUser: false,
      timestamp: new Date(),
      options
    });
  }
}