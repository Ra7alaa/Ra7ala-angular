
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Company, CompanyCreateRequest } from '../../auth/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  // Use the correct API URL from environment
  private apiUrl = `${environment.apiUrl}/api/Company`;


//   constructor(private http: HttpClient) {}

//   /**
//    * Get all companies
//    */
//   getAllCompanies(): Observable<Company[]> {
//     return this.http
//       .get<Company[]>(this.apiUrl)
//       .pipe(catchError(this.handleError));
//   }

//   /**
//    * Get a specific company by ID
//    */
//   getCompanyById(id: number): Observable<Company> {
//     return this.http
//       .get<Company>(`${this.apiUrl}/${id}`)
//       .pipe(catchError(this.handleError));
//   }


  /**
   * Create a new company
   */
  createCompany(company: CompanyCreateRequest): Observable<Company> {
    try {
      // Validate required fields before sending request
      this.validateCompanyData(company);
      
      // Create FormData object for multipart/form-data submission
      const formData = new FormData();
      
      // Add all required fields to FormData with exact field names
      formData.append('Name', company.Name);
      formData.append('Description', company.Description);
      formData.append('Address', company.Address);
      formData.append('Phone', company.Phone);
      formData.append('Email', company.Email);
      formData.append('SuperAdminName', company.SuperAdminName);
      formData.append('SuperAdminEmail', company.SuperAdminEmail);
      formData.append('SuperAdminPhone', company.SuperAdminPhone);
      
      // Add optional Website field if provided
      if (company.Website && typeof company.Website === 'string' && company.Website.trim() !== '') {
        formData.append('Website', company.Website);
      }
      
      // Add logo file if available
      if (this.logoFile) {
        formData.append('Logo', this.logoFile, this.logoFile.name);
      }
      
      console.log('Sending company registration request to:', this.apiUrl);
      
      // Send request - don't set Content-Type, browser will add boundary
      return this.http.post<Company>(this.apiUrl, formData)
        .pipe(
          catchError(error => {
            console.error('Company creation failed:', error);
            return this.handleError(error);
          })
        );
    } catch (validationError) {
      console.error('Validation failed:', validationError);
      return throwError(() => validationError);
    }
  }

  /**
   * Set the logo file to use for company creation
   */
  setLogoFile(file: File | null) {
    this.logoFile = file;
  }

  // File storage for logo upload
  private logoFile: File | null = null;

  /**
   * Update a company
   */
  updateCompany(id: number, company: Partial<Company>): Observable<Company> {
    return this.http
      .put<Company>(`${this.apiUrl}/${id}`, company)
      .pipe(catchError(this.handleError));
  }


  /**
   * Validate company data before sending to API
   */
  private validateCompanyData(company: CompanyCreateRequest): void {
    const requiredFields = {
      Name: 'Company name',
      Email: 'Company email',
      Phone: 'Phone number',
      Address: 'Address',
      Description: 'Description',
      SuperAdminName: 'Super Admin name',
      SuperAdminEmail: 'Super Admin email',
      SuperAdminPhone: 'Super Admin phone'
    };
    
    const missingFields = [];
    
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!company[field as keyof CompanyCreateRequest]) {
        missingFields.push(label);
      }
    }
    
    if (missingFields.length > 0) {
      throw new Error(`Please provide the following required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Error handling
   */
  private handleError(error: HttpErrorResponse) {
    console.error('API error:', error);

    if (error.status === 0) {
      // Network error
      return throwError(
        () =>
          new Error(
            'Cannot connect to server. Please check your internet connection.'
          )
      );
    }
    
    // Handle 400 validation errors
    if (error.status === 400 && error.error?.errors) {
      let validationMessages: string[] = [];
      
      // Extract validation messages from the error object
      for (const [field, messages] of Object.entries(error.error.errors)) {
        if (Array.isArray(messages)) {
          validationMessages = validationMessages.concat(messages as string[]);
        }
      }
      
      if (validationMessages.length > 0) {
        return throwError(() => new Error(validationMessages.join('\n')));
      }
    }

    const errorMessage =
      error.error?.message || error.message || 'An unknown error occurred';
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Diagnostic test method to directly test the API with known good data
   */
  testCompanyCreation(): Observable<any> {
    console.log('Running diagnostic test for company creation API');
    
    // Create FormData object
    const formData = new FormData();
    
    // Add test data that matches the expected format exactly
    formData.append('Name', 'Test Company');
    formData.append('Description', 'This is a test company for diagnostic purposes');
    formData.append('Address', 'Test Address, City, Country');
    formData.append('Phone', '+201012345678');
    formData.append('Email', 'test@example.com');
    formData.append('SuperAdminName', 'Test Admin');
    formData.append('SuperAdminEmail', 'admin@example.com');
    formData.append('SuperAdminPhone', '+201012345679');
    
    console.log('Test FormData created with all required fields');
    
    // Log what we're sending
    formData.forEach((value, key) => {
      console.log(`- ${key}: ${value}`);
    });
    
    // Send direct test request to the API
    return this.http.post(this.apiUrl, formData)
      .pipe(
        catchError(error => {
          console.error('Test company creation failed with status:', error.status);
          console.error('Error details:', error);
          return throwError(() => error);
        })
      );
  }
}

