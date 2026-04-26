import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserProfileComponent } from './pages/profile/user-profile.component';
import { UserBookingsComponent } from './pages/bookings/user-bookings.component';

const routes: Routes = [
  {
    path: 'bookings',
    component: UserBookingsComponent,
  },
  {
    path: '',
    component: UserProfileComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
