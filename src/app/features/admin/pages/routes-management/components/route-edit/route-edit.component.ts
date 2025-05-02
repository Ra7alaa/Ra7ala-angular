// import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   FormBuilder,
//   FormGroup,
//   FormsModule,
//   ReactiveFormsModule,
//   Validators,
// } from '@angular/forms';
// import { TranslatePipe } from '../../../../../../features/settings/pipes/translate.pipe';
// import { Route, RouteUpdateRequest } from '../../../../models/route.model';
// import { RoutesService } from '../../../../services/routes.service';
// import { HttpErrorResponse } from '@angular/common/http';

// @Component({
//   selector: 'app-route-edit',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     TranslatePipe,
//   ],
//   templateUrl: './route-edit.component.html',
//   styleUrl: './route-edit.component.css'
// })
// export class RouteEditComponent implements OnInit {
//   @Input() route: Route | null = null;
//   @Output() routeUpdated = new EventEmitter<boolean>();
  
//   editRouteForm!: FormGroup;
//   isSubmitting = false;
//   error: string | null = null;
  
//   // City options for dropdowns
//   cityOptions = [
//     { id: 1, name: 'Cairo' },
//     { id: 2, name: 'Alexandria' },
//     { id: 3, name: 'Luxor' },
//     { id: 4, name: 'Aswan' },
//     { id: 5, name: 'Hurghada' },
//     { id: 6, name: 'Sharm El Sheikh' },
//     { id: 7, name: 'Tanta' },
//     { id: 8, name: 'Mansoura' },
//     { id: 9, name: 'Port Said' },
//     { id: 10, name: 'Suez' },
//   ];

//   constructor(
//     private routesService: RoutesService,
//     private fb: FormBuilder
//   ) {
//     this.initializeForm();
//   }

//   ngOnInit(): void {
//     if (this.route) {
//       this.setupEditForm(this.route);
//     }
//   }

//   // Initialize edit form
//   initializeForm(): void {
//     this.editRouteForm = this.fb.group({
//       id: ['', Validators.required],
//       startCityId: ['', Validators.required],
//       endCityId: ['', Validators.required],
//       distance: ['', [Validators.required, Validators.min(1)]],
//       durationHours: ['', [Validators.required, Validators.min(0)]],
//       durationMinutes: [
//         '',
//         [Validators.required, Validators.min(0), Validators.max(59)],
//       ],
//       isActive: [true],
//     });
//   }

//   // Setup edit form with route data
//   setupEditForm(route: Route): void {
//     this.editRouteForm.patchValue({
//       id: route.id,
//       startCityId: route.startCityId,
//       endCityId: route.endCityId,
//       distance: route.distance,
//       durationHours: route.durationHours,
//       durationMinutes: route.durationMinutes,
//       isActive: route.isActive,
//     });
//   }

//   // Update existing route
//   updateRoute(): void {
//     if (this.editRouteForm.invalid) {
//       // Mark all fields as touched to show validation errors
//       Object.keys(this.editRouteForm.controls).forEach((key) => {
//         this.editRouteForm.get(key)?.markAsTouched();
//       });
//       return;
//     }

//     this.isSubmitting = true;
//     const formValues = this.editRouteForm.value;

//     // Create update request object
//     const routeRequest: RouteUpdateRequest = {
//       id: formValues.id,
//       startCityId: formValues.startCityId,
//       startCityName: this.getCityNameById(formValues.startCityId),
//       endCityId: formValues.endCityId,
//       endCityName: this.getCityNameById(formValues.endCityId),
//       distance: formValues.distance,
//       durationHours: formValues.durationHours,
//       durationMinutes: formValues.durationMinutes,
//       isActive: formValues.isActive,
//     };

//     this.routesService.updateRoute(routeRequest).subscribe({
//       next: () => {
//         this.isSubmitting = false;
//         this.routeUpdated.emit(true);
//       },
//       error: (err: HttpErrorResponse) => {
//         console.error('Error updating route:', err);
//         this.error = 'Failed to update route. Please try again.';
//         this.isSubmitting = false;
//         this.routeUpdated.emit(false);
//       },
//     });
//   }
  
//   // Reset form
//   resetForm(): void {
//     if (this.route) {
//       this.setupEditForm(this.route);
//     } else {
//       this.editRouteForm.reset();
//     }
//   }

//   // Find city name by ID
//   getCityNameById(id: number): string {
//     const city = this.cityOptions.find((c) => c.id === id);
//     return city ? city.name : 'Unknown';
//   }
// }
