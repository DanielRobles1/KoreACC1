import { animate, group, query, style, transition, trigger } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
    transition('Empresa => Periodos', [
        query(':enter, :leave', [
            style({
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
            })
        ], { optional: true }),

        group([
            query(':leave', [
                animate('140ms ease-out', style({ transform: 'translateX(-4px)', opacity: 0 }))
            ], { optional: true }),

            query(':enter', [
                style({ transform: 'translateX(6px)', opacity: 0 }),
                animate('160ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
            ], { optional: true }),
        ]),
    ]),

    transition('Periodos => Empresa', [
        query(':enter, :leave', [
            style({
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
            })
        ], { optional: true }),

        group([
            query(':leave', [
                animate('140ms ease-out', style({ transform: 'translateX(4px)', opacity: 0 }))
            ], { optional: true }),

            query(':enter', [
                style({ transform: 'translateX(-6px)', opacity: 0 }),
                animate('160ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
            ], { optional: true }),
        ]),
    ]),
]);
