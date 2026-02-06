"""
Management command to check and update tournament completion status
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from chess.models import TournamentActive, Match


class Command(BaseCommand):
    help = 'Check and update tournament completion status for tournaments with all matches completed'

    def handle(self, *args, **options):
        # Find all in_progress tournaments
        tournaments = TournamentActive.objects.filter(tournament_status='in_progress')
        
        updated_count = 0
        
        for tournament in tournaments:
            matches = Match.objects.filter(tournament=tournament)
            total_matches = matches.count()
            
            if total_matches == 0:
                self.stdout.write(self.style.WARNING(
                    f'Tournament {tournament.tournament_id} ({tournament.tournament_name}) has no matches - skipping'
                ))
                continue
            
            completed_matches = matches.filter(match_status='completed').count()
            
            self.stdout.write(
                f'Tournament {tournament.tournament_id} ({tournament.tournament_name}): '
                f'{completed_matches}/{total_matches} matches completed'
            )
            
            if completed_matches == total_matches:
                tournament.tournament_status = 'completed'
                tournament.end_date = timezone.now()
                tournament.save()
                updated_count += 1
                
                self.stdout.write(self.style.SUCCESS(
                    f'  ✓ Updated tournament {tournament.tournament_id} to COMPLETED'
                ))
        
        if updated_count > 0:
            self.stdout.write(self.style.SUCCESS(
                f'\nSuccessfully updated {updated_count} tournament(s)'
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                '\nNo tournaments needed updating'
            ))
