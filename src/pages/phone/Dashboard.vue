<template>
  <div class="phone__container p-6">
    <div class="phone__section">
      <div class="phone__agent">
        <div class="phone__agentcard">
          <AgentCard
            :training-complete="allTrainingCompleted"
            :training-items="trainings"
            :user-training-items="userTrainings"
            @phone:showTraining="($event) => (isShowingTrainingModal = $event)"
            @dialer:close="() => (numberToDial = null)"
            :number-to-dial="numberToDial"
          />
        </div>
        <div class="phone__general">
          <GeneralStatistics />
        </div>
        <div class="phone__agentmetrics">
          <AgentAnalytics />
        </div>
      </div>
    </div>

    <div class="phone__section">
      <div class="phone__main">
        <CallVolumeChart
          :calls-dataset="totalCalls"
          :missed-dataset="totalMissed"
          :cases-dataset="newCases"
          :loading="!historicMetricsReady"
        />
        <div>
          <div class="phone__social">
            <leaderboard />
            <NewsTrainingCard
              :training-items="trainings"
              :user-training-items="userTrainings"
              @phone:showTraining="
                ($event) => (isShowingTrainingModal = $event)
              "
            />
          </div>
        </div>
        <CallHistory @row:click="({ mobile }) => (numberToDial = mobile)" />
        <ContactTable v-if="currentUser && currentUser.isAdmin" />
      </div>
      <TrainingModal
        v-if="isShowingTrainingModal"
        :training-items="trainings"
        :user-training-items="userTrainings"
        :visible="isShowingTrainingModal"
        @onClose="
          () => {
            isShowingTrainingModal = false;
            onTrainingComplete();
          }
        "
        @onComplete="onTrainingComplete"
      ></TrainingModal>
    </div>
  </div>
</template>

<script>
import User from '@/models/User';
import Leaderboard from '@/components/phone/Widgets/Leaderboard.vue';
import CallHistory from '@/components/phone/Widgets/CallHistory.vue';
import ContactTable from '@/components/phone/Widgets/ContactTable.vue';
import NewsTrainingCard from '@/components/phone/Widgets/NewsTrainingCard.vue';
import TrainingModal from '@/components/phone/TrainingsModal.vue';
import AgentCard from '@/components/phone/AgentCard.vue';
import GeneralStatistics from '@/components/phone/Widgets/GeneralStatistics.vue';
import AgentAnalytics from '@/components/phone/Cards/StatsCard.vue';
import CallVolumeChart from '@/components/phone/Widgets/CallVolumeChart.vue';
import { mapState, mapGetters } from 'vuex';
import { TrainingMixin } from '@/mixins';

export default {
  name: 'PhoneDashboard',
  mixins: [TrainingMixin],
  components: {
    AgentAnalytics,
    AgentCard,
    CallHistory,
    NewsTrainingCard,
    Leaderboard,
    ContactTable,
    TrainingModal,
    GeneralStatistics,
    CallVolumeChart,
  },
  data() {
    return {
      loading: false,
      isShowingTrainingModal: false,
      numberToDial: null,
    };
  },
  computed: {
    ...mapState('phone.controller', ['historicMetrics']),
    ...mapGetters('phone.controller', ['historicMetricsReady']),
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    newCases() {
      return this.buildHistoricDataSet('worksites');
    },
    totalCalls() {
      return this.buildHistoricDataSet('total_calls');
    },
    totalMissed() {
      return this.buildHistoricDataSet('missed');
    },
  },
  async mounted() {
    await this.loadTrainingData();
  },
  methods: {
    async onTrainingComplete() {
      this.$emit('phone:showTrainingModal', false);
      await this.loadTrainingData();
    },
    buildHistoricDataSet(key) {
      return this.historicMetrics.daily.map(({ day, ...metric }) => ({
        x: day,
        y: metric[key],
      }));
    },
  },
};
</script>

<style scoped lang="postcss">
@lost flexbox flex;

.phone {
  &__container {
    lost-flex-container: row;
    .phone__section {
      &:first-child {
        lost-column: 1/4 0;
      }
      &:last-child {
        lost-column: 3/4 0;
      }

      .phone__agent {
        lost-flex-container: column;
        div {
          lost-row: 1/3;
        }
      }

      .phone__main {
        lost-flex-container: column;
        div {
          height: 100%;
          lost-row: 1/3;
          &:nth-child(2) {
            .phone__social {
              lost-flex-container: row;
              @apply h-full;
              div {
                lost-row: 1/3 0;
                lost-column: 1/2;
              }
            }
          }
        }
      }
    }
  }
}
</style>
