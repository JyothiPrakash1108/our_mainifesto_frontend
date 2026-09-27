import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  otp: string = '';
  step: 'email' | 'otp' = 'email';
  loading: boolean = false;
  error: string = '';
  message: string = '';
  otpTimer: number = 0;
  otpExpired: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  sendOtp(): void {
    if (!this.email || !this.isValidEmail(this.email)) {
      this.error = 'Please enter a valid email address';
      return;
    }

    this.loading = true;
    this.error = '';
    this.message = '';

    this.authService.sendOtp(this.email).subscribe({
      next: (response) => {
        this.step = 'otp';
        this.message = 'OTP sent successfully! Check your email.';
        this.startOtpTimer();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to send OTP. Please try again.';
        this.loading = false;
      }
    });
  }

  verifyOtp(): void {
    if (!this.otp || this.otp.length !== 6) {
      this.error = 'Please enter a valid 6-digit OTP';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.verifyOtp(this.email, this.otp).subscribe({
      next: (response) => {
        const token = response.token;
        this.authService.saveToken(token);
        this.message = 'Login successful!';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Invalid OTP. Please try again.';
        this.loading = false;
      }
    });
  }

  resendOtp(): void {
    this.sendOtp();
  }

  goBack(): void {
    this.step = 'email';
    this.error = '';
    this.message = '';
    this.otp = '';
    this.otpTimer = 0;
    this.otpExpired = false;
  }

  private startOtpTimer(): void {
    this.otpTimer = 600; // 10 minutes in seconds
    this.otpExpired = false;

    const timer = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer <= 0) {
        this.otpExpired = true;
        clearInterval(timer);
      }
    }, 1000);
  }

  getTimerDisplay(): string {
    const minutes = Math.floor(this.otpTimer / 60);
    const seconds = this.otpTimer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
